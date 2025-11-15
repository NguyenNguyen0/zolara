import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  Inject,
  forwardRef,
} from '@nestjs/common';

import { MessageService } from './message.service';
import { EventService } from '../event/event.service';

// Interface cho tin nhắn với các trường cần thiết
type MessageData = {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: any;
  messageType?: 'USER' | 'GROUP';
  reactions?: any[];
  readBy?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any; // Cho phép các trường khác
};

@Injectable()
@WebSocketGateway({
  cors: {
    origin: true, // Sử dụng true thay vì '*' để tương thích với cài đặt CORS của ứng dụng
    credentials: true,
  },
  namespace: '/message',
  pingInterval: 30000, // 30 seconds
  pingTimeout: 30000, // 30 seconds
  transports: ['websocket', 'polling'], // Hỗ trợ cả WebSocket và polling để tăng độ tin cậy
  allowUpgrades: true, // Cho phép nâng cấp từ polling lên websocket
  connectTimeout: 60000, // Tăng thời gian timeout kết nối lên 60 giây
  maxHttpBufferSize: 1e8, // Tăng kích thước buffer cho các tin nhắn lớn (100MB)
})
export class MessageGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    OnModuleDestroy
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessageGateway.name);
  private userSockets: Map<string, Set<Socket>> = new Map();
  private socketToUser: Map<string, string> = new Map();
  private lastActivity: Map<string, number> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    @Inject(forwardRef(() => MessageService))
    private readonly messageService?: MessageService,
    private readonly eventService?: EventService,
  ) {
    // Lắng nghe sự kiện từ EventService
    if (this.eventService) {
      this.eventService.eventEmitter.on(
        'group.member.added',
        this.handleGroupMemberAdded.bind(this),
      );
      this.eventService.eventEmitter.on(
        'group.member.removed',
        this.handleGroupMemberRemoved.bind(this),
      );
      this.eventService.eventEmitter.on(
        'message.recalled',
        this.handleMessageRecalled.bind(this),
      );
      this.eventService.eventEmitter.on(
        'message.read',
        this.handleMessageRead.bind(this),
      );
      this.eventService.eventEmitter.on(
        'group.dissolved',
        this.handleGroupDissolved.bind(this),
      );
    }
  }

  private async getUserFromSocket(client: Socket): Promise<string> {
    // Đơn giản hóa: lấy userId từ query parameter hoặc sử dụng một giá trị mặc định
    const userId =
      (client.handshake.query.userId as string) ||
      (client.handshake.auth.userId as string);

    // Nếu có userId trong query hoặc auth, sử dụng nó
    if (userId) {
      return userId;
    }

    // Nếu không có userId, tạo một ID ngẫu nhiên
    const randomId = Math.random().toString(36).substring(2, 15);
    this.logger.debug(
      `Generated random userId: ${randomId} for socket ${client.id}`,
    );
    return randomId;
  }

  private addUserSocket(userId: string, socket: Socket) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket);
    this.socketToUser.set(socket.id, userId);
    this.lastActivity.set(socket.id, Date.now());
    this.logger.debug(`User ${userId} connected with socket ${socket.id}`);
  }

  private removeUserSocket(userId: string, socket: Socket) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.delete(socket);
      if (userSockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.socketToUser.delete(socket.id);
    this.lastActivity.delete(socket.id);
    this.logger.debug(`Socket ${socket.id} for user ${userId} removed`);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.logger.log('WebSocket Gateway cleanup interval cleared');
    }
  }

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway initialized');

    // Setup cleanup interval to run every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSockets();
    }, 60000); // 1 minute
  }

  async handleConnection(client: Socket) {
    try {
      // Ghi log thông tin kết nối
      this.logger.log(
        `Client connected: ${client.id}, transport: ${client.conn.transport.name}`,
      );

      const userId = await this.getUserFromSocket(client);
      // Không cần kiểm tra userId nữa vì luôn có giá trị

      this.addUserSocket(userId, client);

      // Join user's personal room
      client.join(`user:${userId}`);

      // Join all group rooms the user is a member of
      if (this.messageService) {
        try {
          const userGroups = await this.messageService.getUserGroups(userId);
          userGroups.forEach((groupId) => {
            client.join(`group:${groupId}`);
          });
        } catch (error) {
          this.logger.error(`Error joining group rooms: ${error.message}`);
        }
      }

      // Emit user online status
      this.server.emit('userStatus', {
        userId,
        status: 'online',
        timestamp: new Date(),
      });

      // Gửi thông báo kết nối thành công
      client.emit('connectionEstablished', {
        userId,
        socketId: client.id,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error in handleConnection: ${error.message}`);
      // Thử kết nối lại nếu có lỗi
      client.emit('connectionError', {
        message: 'Error establishing connection, please reconnect',
        timestamp: new Date(),
      });
    }
  }

  private cleanupInactiveSockets() {
    const now = Date.now();
    const inactivityThreshold = 5 * 60 * 1000; // Tăng lên 5 phút để giảm ngắt kết nối không cần thiết

    this.logger.debug(
      `Running socket cleanup, checking ${this.lastActivity.size} sockets`,
    );

    for (const [socketId, lastActive] of this.lastActivity.entries()) {
      if (now - lastActive > inactivityThreshold) {
        const userId = this.socketToUser.get(socketId);
        if (userId) {
          this.logger.warn(
            `Socket ${socketId} for user ${userId} inactive for too long, disconnecting`,
          );

          // Find the socket instance
          const userSockets = this.userSockets.get(userId);
          if (userSockets) {
            for (const socket of userSockets) {
              if (socket.id === socketId) {
                try {
                  // Gửi thông báo trước khi ngắt kết nối
                  socket.emit('connectionWarning', {
                    message: 'Connection inactive, will be disconnected soon',
                    timestamp: new Date(),
                  });
                  // Ngắt kết nối với lý do rõ ràng
                  socket.disconnect(true);
                } catch (error) {
                  this.logger.error(
                    `Error disconnecting socket ${socketId}: ${error.message}`,
                  );
                }
                break;
              }
            }
          }
        }
      }
    }
  }

  handleDisconnect(client: Socket) {
    try {
      this.getUserFromSocket(client)
        .then((userId) => {
          this.removeUserSocket(userId, client);

          // If no more sockets for this user, emit offline status
          if (!this.userSockets.has(userId)) {
            this.server.emit('userStatus', {
              userId,
              status: 'offline',
              timestamp: new Date(),
            });
          }

          // Ghi log thông tin ngắt kết nối
          this.logger.log(
            `Client disconnected: ${client.id}, transport: ${client.conn.transport.name}, reason: ${client.conn.transport.readyState}`,
          );
        })
        .catch((error) => {
          this.logger.error(`Error in handleDisconnect: ${error.message}`);
        });
    } catch (error) {
      this.logger.error(
        `Unexpected error in handleDisconnect: ${error.message}`,
      );
    }
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(@ConnectedSocket() client: Socket) {
    try {
      const socketId = client.id;
      this.lastActivity.set(socketId, Date.now());
      return { status: 'ok', timestamp: Date.now() };
    } catch (error) {
      this.logger.error(`Error in heartbeat: ${error.message}`);
      return { status: 'error', message: error.message, timestamp: Date.now() };
    }
  }

  /**
   * Phát sự kiện tin nhắn mới đến người dùng
   * @param message Tin nhắn đã được lưu vào database
   */
  notifyNewUserMessage(message: MessageData) {
    // Đảm bảo tin nhắn có đầy đủ thông tin để phân biệt
    const messageWithType = {
      ...message,
      messageType: 'USER', // Đảm bảo trường messageType luôn được đặt
    };

    const eventData = {
      type: 'user',
      message: messageWithType,
      timestamp: new Date(),
      isUserMessage: true, // Thêm trường để phân biệt rõ ràng hơn
    };

    if (this.server) {
      try {
        this.logger.debug(`[Message Event] Sending user message:`, {
          messageId: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content,
          timestamp: eventData.timestamp,
        });

        // Phát sự kiện đến người gửi
        this.server
          .to(`user:${message.senderId}`)
          .emit('newMessage', eventData);
        this.logger.debug(
          `[Message Event] Message sent to sender: ${message.senderId}`,
        );

        // Phát sự kiện đến người nhận
        if (message.receiverId) {
          this.server
            .to(`user:${message.receiverId}`)
            .emit('newMessage', eventData);
          this.logger.debug(
            `[Message Event] Message sent to receiver: ${message.receiverId}`,
          );

          // Phát sự kiện dừng nhập
          this.server
            .to(`user:${message.receiverId}`)
            .emit('userTypingStopped', {
              userId: message.senderId,
              timestamp: new Date(),
            });
          this.logger.debug(
            `[Message Event] Typing stopped notification sent to: ${message.receiverId}`,
          );
        }
      } catch (error) {
        this.logger.error(`[Message Event] Error sending user message event:`, {
          error: error.message,
          messageId: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
        });
      }
    } else {
      this.logger.warn(
        '[Message Event] Socket.IO server not initialized yet, cannot send user message',
        { messageId: message.id },
      );
    }
  }

  /**
   * Phát sự kiện tin nhắn mới đến nhóm
   * @param message Tin nhắn đã được lưu vào database
   */
  notifyNewGroupMessage(message: MessageData) {
    // Đảm bảo tin nhắn có đầy đủ thông tin để phân biệt
    const messageWithType = {
      ...message,
      messageType: 'GROUP', // Đảm bảo trường messageType luôn được đặt
    };

    const eventData = {
      type: 'group', // Đánh dấu rõ ràng là tin nhắn nhóm
      message: messageWithType,
      timestamp: new Date(),
      isGroupMessage: true, // Thêm trường để phân biệt rõ ràng hơn
    };

    // Phát sự kiện đến phòng nhóm
    if (message.groupId && this.server) {
      try {
        this.logger.debug(`[Message Event] Sending group message:`, {
          messageId: message.id,
          senderId: message.senderId,
          groupId: message.groupId,
          content: message.content,
          timestamp: eventData.timestamp,
        });

        this.server
          .to(`group:${message.groupId}`)
          .emit('newMessage', eventData);
        this.logger.debug(
          `[Message Event] Message sent to group: ${message.groupId}`,
        );

        // Phát sự kiện dừng nhập
        this.server.to(`group:${message.groupId}`).emit('userTypingStopped', {
          userId: message.senderId,
          groupId: message.groupId,
          timestamp: new Date(),
        });
        this.logger.debug(
          `[Message Event] Typing stopped notification sent to group: ${message.groupId}`,
        );
      } catch (error) {
        this.logger.error(
          `[Message Event] Error sending group message event:`,
          {
            error: error.message,
            messageId: message.id,
            senderId: message.senderId,
            groupId: message.groupId,
          },
        );
      }
    } else {
      this.logger.warn(
        '[Message Event] Socket.IO server not initialized yet, cannot send group message',
        { messageId: message.id, groupId: message.groupId },
      );
    }
  }

  /**
   * Phát sự kiện đã đọc tin nhắn
   * @param message Tin nhắn đã được cập nhật trạng thái đọc
   * @param userId ID của người đọc
   */
  notifyMessageRead(message: MessageData, userId: string) {
    try {
      const readEvent = {
        messageId: message.id,
        readBy: message.readBy,
        userId,
        timestamp: new Date(),
      };

      // Đối với tin nhắn cá nhân
      if (message.messageType === 'USER') {
        try {
          this.server
            .to(`user:${message.senderId}`)
            .emit('messageRead', readEvent);
        } catch (error) {
          this.logger.error(
            `Error notifying sender ${message.senderId}: ${error.message}`,
          );
        }

        try {
          this.server
            .to(`user:${message.receiverId}`)
            .emit('messageRead', readEvent);
        } catch (error) {
          this.logger.error(
            `Error notifying receiver ${message.receiverId}: ${error.message}`,
          );
        }
      }
      // Đối với tin nhắn nhóm
      else if (message.messageType === 'GROUP') {
        try {
          if (this.server) {
            this.server
              .to(`group:${message.groupId}`)
              .emit('messageRead', readEvent);
          } else {
            this.logger.warn(
              `Socket.IO server not initialized yet, cannot notify group ${message.groupId} about message read`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error notifying group ${message.groupId}: ${error.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error in notifyMessageRead: ${error.message}`);
    }
  }

  /**
   * Phát sự kiện thu hồi tin nhắn
   * @param message Tin nhắn đã được thu hồi
   * @param userId ID của người thu hồi
   */
  notifyMessageRecalled(message: MessageData, userId: string) {
    const recallEvent = {
      messageId: message.id,
      userId,
      timestamp: new Date(),
    };

    if (this.server) {
      try {
        // Đối với tin nhắn cá nhân
        if (message.messageType === 'USER') {
          this.server
            .to(`user:${message.senderId}`)
            .emit('messageRecalled', recallEvent);
          this.server
            .to(`user:${message.receiverId}`)
            .emit('messageRecalled', recallEvent);
        }
        // Đối với tin nhắn nhóm
        else if (message.messageType === 'GROUP') {
          this.server
            .to(`group:${message.groupId}`)
            .emit('messageRecalled', recallEvent);
        }
      } catch (error) {
        this.logger.error(
          `Error sending message recall event: ${error.message}`,
        );
      }
    } else {
      this.logger.warn(
        'Socket.IO server not initialized yet, cannot send message recall event',
      );
    }
  }

  /**
   * Phát sự kiện cập nhật phản ứng tin nhắn
   * @param message Tin nhắn đã được cập nhật phản ứng
   * @param userId ID của người thêm/xóa phản ứng
   */
  notifyMessageReactionUpdated(message: MessageData, userId: string) {
    const reactionEvent = {
      messageId: message.id,
      reactions: message.reactions,
      userId,
      timestamp: new Date(),
    };

    if (this.server) {
      try {
        // Đối với tin nhắn cá nhân
        if (message.messageType === 'USER') {
          this.server
            .to(`user:${message.senderId}`)
            .emit('messageReactionUpdated', reactionEvent);
          this.server
            .to(`user:${message.receiverId}`)
            .emit('messageReactionUpdated', reactionEvent);
        }
        // Đối với tin nhắn nhóm
        else if (message.messageType === 'GROUP') {
          this.server
            .to(`group:${message.groupId}`)
            .emit('messageReactionUpdated', reactionEvent);
        }
      } catch (error) {
        this.logger.error(
          `Error sending message reaction update event: ${error.message}`,
        );
      }
    } else {
      this.logger.warn(
        'Socket.IO server not initialized yet, cannot send message reaction update event',
      );
    }
  }

  /**
   * Phát sự kiện xóa tin nhắn (phía người dùng)
   * @param message Tin nhắn đã bị xóa
   * @param userId ID của người xóa tin nhắn
   */
  notifyMessageDeleted(message: MessageData, userId: string) {
    const deleteEvent = {
      messageId: message.id,
      userId,
      deletedBy: message.deletedBy,
      timestamp: new Date(),
    };

    if (this.server) {
      try {
        // Chỉ thông báo cho người xóa tin nhắn
        this.server.to(`user:${userId}`).emit('messageDeleted', deleteEvent);
      } catch (error) {
        this.logger.error(
          `Error sending message deleted event: ${error.message}`,
        );
      }
    } else {
      this.logger.warn(
        'Socket.IO server not initialized yet, cannot send message deleted event',
      );
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId?: string; groupId?: string },
  ) {
    const userId = await this.getUserFromSocket(client);

    // Update last activity
    this.lastActivity.set(client.id, Date.now());

    const typingEvent = {
      userId,
      timestamp: new Date(),
    };

    if (data.receiverId) {
      this.server.to(`user:${data.receiverId}`).emit('userTyping', {
        ...typingEvent,
        receiverId: data.receiverId,
      });
    } else if (data.groupId) {
      this.server.to(`group:${data.groupId}`).emit('userTyping', {
        ...typingEvent,
        groupId: data.groupId,
      });
    }
  }

  @SubscribeMessage('getUserStatus')
  async handleGetUserStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userIds: string[] },
  ) {
    // Update last activity
    this.lastActivity.set(client.id, Date.now());

    try {
      const statusMap = {};

      for (const userId of data.userIds) {
        const isOnline =
          this.userSockets.has(userId) && this.userSockets.get(userId).size > 0;
        statusMap[userId] = {
          userId,
          status: isOnline ? 'online' : 'offline',
          timestamp: Date.now(),
        };
      }

      return statusMap;
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('stopTyping')
  async handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId?: string; groupId?: string },
  ) {
    const userId = await this.getUserFromSocket(client);

    // Update last activity
    this.lastActivity.set(client.id, Date.now());

    const typingEvent = {
      userId,
      timestamp: new Date(),
    };

    if (data.receiverId) {
      this.server.to(`user:${data.receiverId}`).emit('userTypingStopped', {
        ...typingEvent,
        receiverId: data.receiverId,
      });
    } else if (data.groupId) {
      this.server.to(`group:${data.groupId}`).emit('userTypingStopped', {
        ...typingEvent,
        groupId: data.groupId,
      });
    }
  }

  /**
   * Phát sự kiện tin nhắn có media
   * @param message Tin nhắn có media đã được lưu vào database
   */
  notifyMessageWithMedia(message: MessageData) {
    // Phát sự kiện dựa trên loại tin nhắn
    if (message.messageType === 'USER') {
      // Đối với tin nhắn cá nhân, phát đến cả người gửi và người nhận
      this.server.to(`user:${message.senderId}`).emit('newMessage', {
        type: 'user',
        message,
        timestamp: new Date(),
      });

      if (message.receiverId) {
        this.server.to(`user:${message.receiverId}`).emit('newMessage', {
          type: 'user',
          message,
          timestamp: new Date(),
        });
      }
    } else if (message.messageType === 'GROUP' && message.groupId) {
      // Đối với tin nhắn nhóm, phát đến phòng nhóm
      // Đảm bảo tin nhắn có đầy đủ thông tin để phân biệt
      const messageWithType = {
        ...message,
        messageType: 'GROUP', // Đảm bảo trường messageType luôn được đặt
      };

      if (this.server) {
        try {
          this.server.to(`group:${message.groupId}`).emit('newMessage', {
            type: 'group',
            message: messageWithType,
            timestamp: new Date(),
            isGroupMessage: true, // Thêm trường để phân biệt rõ ràng hơn
          });
        } catch (error) {
          this.logger.error(
            `Error sending group message with media event: ${error.message}`,
          );
        }
      } else {
        this.logger.warn(
          'Socket.IO server not initialized yet, cannot send group message with media',
        );
      }
    }
  }

  /**
   * Xử lý sự kiện thêm thành viên vào nhóm
   * @param payload Dữ liệu sự kiện
   */
  private async handleGroupMemberAdded(payload: {
    groupId: string;
    userId: string;
    addedById: string;
  }): Promise<void> {
    const { groupId, userId, addedById } = payload;
    this.logger.debug(
      `Handling group.member.added event: ${groupId}, ${userId}`,
    );

    // Tìm tất cả socket của người dùng và thêm vào phòng nhóm
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      for (const socket of userSockets) {
        socket.join(`group:${groupId}`);
      }
      this.logger.debug(
        `User ${userId} joined group room ${groupId} via event`,
      );

      // Thông báo cho người dùng cập nhật danh sách nhóm của họ
      if (this.server) {
        try {
          this.server.to(`user:${userId}`).emit('updateGroupList', {
            action: 'added_to_group',
            groupId,
            addedById,
            timestamp: new Date(),
          });
        } catch (error) {
          this.logger.error(
            `Error sending updateGroupList event: ${error.message}`,
          );

          // Fallback: gửi trực tiếp đến các socket của người dùng
          for (const socket of userSockets) {
            try {
              socket.emit('updateGroupList', {
                action: 'added_to_group',
                groupId,
                addedById,
                timestamp: new Date(),
              });
            } catch (socketError) {
              this.logger.error(
                `Error sending direct socket event: ${socketError.message}`,
              );
            }
          }
        }
      } else {
        this.logger.warn(
          'Socket.IO server not initialized yet, sending direct to sockets',
        );

        // Fallback: gửi trực tiếp đến các socket của người dùng
        for (const socket of userSockets) {
          try {
            socket.emit('updateGroupList', {
              action: 'added_to_group',
              groupId,
              addedById,
              timestamp: new Date(),
            });
          } catch (socketError) {
            this.logger.error(
              `Error sending direct socket event: ${socketError.message}`,
            );
          }
        }
      }
    }

    // Nếu người dùng không có socket nào đang kết nối, họ sẽ nhận được thông báo khi kết nối lại
    // và sẽ tự động tham gia vào các phòng nhóm thông qua handleConnection
  }

  /**
   * Xử lý sự kiện xóa thành viên khỏi nhóm
   * @param payload Dữ liệu sự kiện
   */
  private handleGroupMemberRemoved(payload: {
    groupId: string;
    userId: string;
    removedById: string;
    kicked?: boolean;
    left?: boolean;
  }): void {
    const { groupId, userId, removedById, kicked, left } = payload;
    this.logger.debug(
      `Handling group.member.removed event: ${groupId}, ${userId}`,
    );

    // Tìm tất cả socket của người dùng và xóa khỏi phòng nhóm
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      for (const socket of userSockets) {
        socket.leave(`group:${groupId}`);
      }
      this.logger.debug(`User ${userId} left group room ${groupId} via event`);

      // Thông báo cho người dùng cập nhật danh sách nhóm của họ
      if (this.server) {
        try {
          this.server.to(`user:${userId}`).emit('updateGroupList', {
            action: 'removed_from_group',
            groupId,
            removedById,
            kicked,
            left,
            timestamp: new Date(),
          });
        } catch (error) {
          this.logger.error(
            `Error sending updateGroupList event: ${error.message}`,
          );

          // Fallback: gửi trực tiếp đến các socket của người dùng
          for (const socket of userSockets) {
            try {
              socket.emit('updateGroupList', {
                action: 'removed_from_group',
                groupId,
                removedById,
                kicked,
                left,
                timestamp: new Date(),
              });
            } catch (socketError) {
              this.logger.error(
                `Error sending direct socket event: ${socketError.message}`,
              );
            }
          }
        }
      }
    }
  }

  /**
   * Xử lý sự kiện thu hồi tin nhắn
   * @param payload Dữ liệu sự kiện
   */
  private handleMessageRecalled(payload: {
    messageId: string;
    userId: string;
  }): void {
    const { messageId, userId } = payload;
    this.logger.debug(`Handling message.recalled event: ${messageId}`);

    // Lấy thông tin tin nhắn từ database
    if (this.messageService) {
      this.messageService.findMessageById(messageId).then((message) => {
        if (message) {
          this.notifyMessageRecalled(message, userId);
        }
      });
    }
  }

  /**
   * Xử lý sự kiện đọc tin nhắn
   * @param payload Dữ liệu sự kiện
   */
  private handleMessageRead(payload: {
    messageId: string;
    userId: string;
  }): void {
    const { messageId, userId } = payload;
    this.logger.debug(`Handling message.read event: ${messageId}`);

    try {
      // Lấy thông tin tin nhắn từ database
      if (this.messageService) {
        this.messageService
          .findMessageById(messageId)
          .then((message) => {
            if (message) {
              this.notifyMessageRead(message, userId);
            }
          })
          .catch((error) => {
            this.logger.error(
              `Error finding message ${messageId}: ${error.message}`,
            );
          });
      }
    } catch (error) {
      this.logger.error(`Error in handleMessageRead: ${error.message}`);
    }
  }

  /**
   * Xử lý sự kiện giải tán nhóm
   * @param payload Dữ liệu sự kiện
   */
  private handleGroupDissolved(payload: {
    groupId: string;
    groupName: string;
    dissolvedById: string;
    timestamp: Date;
    members?: Array<{ userId: string }>;
  }): void {
    const { groupId, groupName, dissolvedById, timestamp, members } = payload;
    this.logger.debug(`Handling group.dissolved event: ${groupId}`);

    // Xóa phòng nhóm khỏi socket.io
    const roomName = `group:${groupId}`;

    if (this.server) {
      try {
        this.server.in(roomName).socketsLeave(roomName);
      } catch (error) {
        this.logger.error(
          `Error removing sockets from room ${roomName}: ${error.message}`,
        );
      }
    } else {
      this.logger.warn(
        `Socket.IO server not initialized yet, cannot remove sockets from room ${roomName}`,
      );
    }

    // Thông báo cho tất cả người dùng trong phòng cập nhật danh sách cuộc trò chuyện
    if (members && members.length > 0) {
      // Sử dụng danh sách thành viên từ payload
      for (const member of members) {
        // Không thông báo cho người giải tán
        if (member.userId !== dissolvedById) {
          if (this.server) {
            try {
              this.server
                .to(`user:${member.userId}`)
                .emit('updateConversationList', {
                  action: 'group_dissolved',
                  groupId,
                  groupName,
                  timestamp: timestamp || new Date(),
                });
            } catch (error) {
              this.logger.error(
                `Error sending updateConversationList event to user ${member.userId}: ${error.message}`,
              );
            }
          } else {
            this.logger.warn(
              `Socket.IO server not initialized yet, cannot notify user ${member.userId} about group dissolution`,
            );
          }
        }
      }
    }

    this.logger.debug(
      `All sockets removed from room ${roomName} and notifications sent`,
    );
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventService } from '../event/event.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: true, // Sử dụng true thay vì '*' để tương thích với cài đặt CORS của ứng dụng
    credentials: true,
  },
  namespace: '/groups',
  pingInterval: 30000, // 30 seconds
  pingTimeout: 30000, // 30 seconds
  transports: ['websocket', 'polling'], // Hỗ trợ cả WebSocket và polling để tăng độ tin cậy
  allowUpgrades: true, // Cho phép nâng cấp từ polling lên websocket
  connectTimeout: 60000, // Tăng thời gian timeout kết nối lên 60 giây
  maxHttpBufferSize: 1e8, // Tăng kích thước buffer cho các tin nhắn lớn (100MB)
})
export class GroupGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('GroupGateway');
  private userSockets: Map<string, Set<Socket>> = new Map();
  private groupRooms: Map<string, Set<string>> = new Map(); // groupId -> Set of userIds

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventService: EventService,
  ) {
    // Lắng nghe sự kiện từ EventService
    this.eventService.eventEmitter.on(
      'group.member.added',
      this.handleGroupMemberAdded.bind(this),
    );
    this.eventService.eventEmitter.on(
      'group.member.removed',
      this.handleGroupMemberRemoved.bind(this),
    );
    this.eventService.eventEmitter.on(
      'group.updated',
      this.handleGroupUpdated.bind(this),
    );
    this.eventService.eventEmitter.on(
      'group.avatar.updated',
      this.handleGroupAvatarUpdated.bind(this),
    );
    this.eventService.eventEmitter.on(
      'group.role.changed',
      this.handleGroupRoleChanged.bind(this),
    );
    this.eventService.eventEmitter.on(
      'group.dissolved',
      this.handleGroupDissolved.bind(this),
    );
  }

  /**
   * Handle joinGroup event from client
   * @param client Socket client
   * @param data Event data containing userId and groupId
   */
  @SubscribeMessage('joinGroup')
  async handleJoinGroupEvent(
    client: Socket,
    data: { userId: string; groupId: string },
  ): Promise<void> {
    const { userId, groupId } = data;
    this.logger.debug(
      `Received joinGroup event: userId=${userId}, groupId=${groupId}`,
    );

    // Add the user to our userSockets map
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(client);

    // Join the user to their personal room
    client.join(`user:${userId}`);

    // Join the user to the group room
    await this.joinGroupRoom(userId, groupId);

    // Confirm to the client
    client.emit('joinedGroup', {
      success: true,
      groupId,
      userId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle joinUserRoom event from client
   * @param client Socket client
   * @param data Event data containing userId
   */
  @SubscribeMessage('joinUserRoom')
  async handleJoinUserRoomEvent(
    client: Socket,
    data: { userId: string },
  ): Promise<void> {
    const { userId } = data;
    this.logger.debug(`Received joinUserRoom event: userId=${userId}`);

    // Add the user to our userSockets map
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(client);

    // Join the user to their personal room
    client.join(`user:${userId}`);

    // Confirm to the client
    client.emit('joinedUserRoom', {
      success: true,
      userId,
      timestamp: new Date(),
    });

    this.logger.debug(`User ${userId} joined personal room user:${userId}`);
  }

  async handleConnection(client: Socket): Promise<void> {
    this.logger.debug(`Client connected: ${client.id}`);

    try {
      // Lấy userId từ token hoặc query params
      const userId =
        client.handshake.auth?.userId ||
        (client.handshake.query?.userId as string);

      if (userId) {
        // Lưu trữ socket của người dùng
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId).add(client);

        // Thêm người dùng vào phòng cá nhân của họ
        client.join(`user:${userId}`);

        this.logger.debug(`User ${userId} connected and joined personal room`);
      }
    } catch (error) {
      this.logger.error(`Error in handleConnection: ${error.message}`);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Client disconnected: ${client.id}`);

    // Clean up user socket mappings
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client)) {
        sockets.delete(client);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  /**
   * Add a user to a group room
   * @param userId User ID
   * @param groupId Group ID
   */
  async joinGroupRoom(userId: string, groupId: string): Promise<void> {
    // Check if user is a member of the group
    const isMember = await this.prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (!isMember) {
      this.logger.warn(`User ${userId} is not a member of group ${groupId}`);
      return;
    }

    // Add user to group room
    if (!this.groupRooms.has(groupId)) {
      this.groupRooms.set(groupId, new Set());
    }
    this.groupRooms.get(groupId).add(userId);

    // Join all user's sockets to the group room
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      for (const socket of userSockets) {
        socket.join(`group:${groupId}`);
      }
    }

    this.logger.debug(`User ${userId} joined group room ${groupId}`);
  }

  /**
   * Remove a user from a group room
   * @param userId User ID
   * @param groupId Group ID
   */
  leaveGroupRoom(userId: string, groupId: string): void {
    // Remove user from group room
    const groupUsers = this.groupRooms.get(groupId);
    if (groupUsers) {
      groupUsers.delete(userId);
      if (groupUsers.size === 0) {
        this.groupRooms.delete(groupId);
      }
    }

    // Leave all user's sockets from the group room
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      for (const socket of userSockets) {
        socket.leave(`group:${groupId}`);
      }
    }

    this.logger.debug(`User ${userId} left group room ${groupId}`);
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

    // Tự động thêm người dùng vào phòng nhóm và đợi hoàn thành
    await this.joinGroupRoom(userId, groupId);

    // Thông báo cho các thành viên trong nhóm
    this.notifyMemberAdded(groupId, {
      groupId,
      userId,
      addedById,
      timestamp: new Date(),
    });

    // Thông báo trực tiếp cho người dùng mới được thêm vào nhóm
    this.notifyUserAddedToGroup(userId, {
      groupId,
      addedById,
      timestamp: new Date(),
      action: 'added_to_group',
    });
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

    // Xóa người dùng khỏi phòng nhóm
    this.leaveGroupRoom(userId, groupId);

    // Thông báo cho các thành viên trong nhóm
    this.notifyMemberRemoved(groupId, {
      groupId,
      userId,
      removedById,
      kicked,
      left,
      timestamp: new Date(),
    });

    // Thông báo trực tiếp cho người dùng bị xóa khỏi nhóm
    this.notifyUserRemovedFromGroup(userId, {
      groupId,
      removedById,
      kicked,
      left,
      timestamp: new Date(),
      action: 'removed_from_group',
    });
  }

  /**
   * Xử lý sự kiện cập nhật thông tin nhóm
   * @param payload Dữ liệu sự kiện
   */
  private handleGroupUpdated(payload: {
    groupId: string;
    data: any;
    updatedById: string;
  }): void {
    const { groupId, data, updatedById } = payload;
    this.logger.debug(`Handling group.updated event: ${groupId}`);

    // Thông báo cho các thành viên trong nhóm
    this.notifyGroupUpdated(groupId, {
      groupId,
      data,
      updatedById,
      timestamp: new Date(),
    });
  }

  /**
   * Xử lý sự kiện cập nhật ảnh đại diện nhóm
   * @param payload Dữ liệu sự kiện
   */
  private handleGroupAvatarUpdated(payload: {
    groupId: string;
    avatarUrl: string;
    updatedById: string;
  }): void {
    const { groupId, avatarUrl, updatedById } = payload;
    this.logger.debug(`Handling group.avatar.updated event: ${groupId}`);

    // Thông báo cho các thành viên trong nhóm
    this.notifyAvatarUpdated(groupId, {
      groupId,
      avatarUrl,
      updatedById,
      timestamp: new Date(),
    });
  }

  /**
   * Xử lý sự kiện thay đổi vai trò thành viên
   * @param payload Dữ liệu sự kiện
   */
  private handleGroupRoleChanged(payload: {
    groupId: string;
    userId: string;
    role: string;
    updatedById: string;
  }): void {
    const { groupId, userId, role, updatedById } = payload;
    this.logger.debug(
      `Handling group.role.changed event: ${groupId}, ${userId}, ${role}`,
    );

    // Thông báo cho các thành viên trong nhóm
    this.notifyRoleChanged(groupId, {
      groupId,
      userId,
      role,
      updatedById,
      timestamp: new Date(),
    });
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
    this.logger.debug(
      `Handling group.dissolved event: ${groupId}, dissolved by ${dissolvedById}`,
    );

    if (members && members.length > 0) {
      // Sử dụng danh sách thành viên từ payload
      this.logger.debug(
        `Using member list from payload: ${members.length} members`,
      );

      // Thông báo cho từng thành viên
      for (const member of members) {
        if (member.userId !== dissolvedById) {
          // Không thông báo cho người giải tán
          this.notifyGroupDissolved({
            groupId,
            groupName,
            userId: member.userId,
            dissolvedBy: dissolvedById,
            timestamp,
            action: 'group_dissolved',
            updateConversationList: true,
          });
        }
      }
    } else {
      // Trường hợp khẩn cấp: Nếu không có danh sách thành viên, thử truy vấn database
      this.logger.warn(
        `No member list in payload, attempting to query database (may fail if group already deleted)`,
      );

      this.prisma.groupMember
        .findMany({
          where: { groupId },
          select: { userId: true },
        })
        .then((dbMembers) => {
          // Thông báo cho từng thành viên
          for (const member of dbMembers) {
            if (member.userId !== dissolvedById) {
              // Không thông báo cho người giải tán
              this.notifyGroupDissolved({
                groupId,
                groupName,
                userId: member.userId,
                dissolvedBy: dissolvedById,
                timestamp,
                action: 'group_dissolved',
                updateConversationList: true,
              });
            }
          }
        })
        .catch((error) => {
          this.logger.error(
            `Error querying members from database: ${error.message}`,
          );
        });
    }

    // Xóa phòng nhóm
    if (this.groupRooms.has(groupId)) {
      this.groupRooms.delete(groupId);
    }
  }

  /**
   * Notify group members about a group update
   * @param groupId Group ID
   * @param data Update data
   */
  notifyGroupUpdated(groupId: string, data: Record<string, any>): void {
    this.server.to(`group:${groupId}`).emit('groupUpdated', data);
  }

  /**
   * Notify group members about a new member
   * @param groupId Group ID
   * @param data Member data
   */
  notifyMemberAdded(groupId: string, data: Record<string, any>): void {
    this.server.to(`group:${groupId}`).emit('memberAdded', data);
  }

  /**
   * Notify group members about a member removal
   * @param groupId Group ID
   * @param data Member data
   */
  notifyMemberRemoved(groupId: string, data: Record<string, any>): void {
    this.server.to(`group:${groupId}`).emit('memberRemoved', data);
  }

  /**
   * Notify group members about a role change
   * @param groupId Group ID
   * @param data Role change data
   */
  notifyRoleChanged(groupId: string, data: Record<string, any>): void {
    this.server.to(`group:${groupId}`).emit('roleChanged', data);
  }

  /**
   * Notify group members about an avatar update
   * @param groupId Group ID
   * @param data Avatar update data
   */
  notifyAvatarUpdated(groupId: string, data: Record<string, any>): void {
    this.server.to(`group:${groupId}`).emit('avatarUpdated', data);
  }

  /**
   * Notify a user about group dissolution
   * @param data Dissolution data including userId to notify
   */
  notifyGroupDissolved(data: Record<string, any>): void {
    // Since the group room no longer exists, we need to notify each user individually
    const userId = data.userId;
    if (userId) {
      // Thêm thông tin rõ ràng cho frontend
      const notificationData = {
        ...data,
        action: data.action || 'group_dissolved',
        updateConversationList: data.updateConversationList !== false, // Mặc định là true
      };

      this.logger.debug(
        `Attempting to notify user ${userId} about dissolution of group ${data.groupId}`,
      );

      // Phương pháp 1: Gửi trực tiếp đến tất cả socket của người dùng
      const userSockets = this.userSockets.get(userId);
      if (userSockets && userSockets.size > 0) {
        // Emit to all user's sockets
        for (const socket of userSockets) {
          socket.emit('groupDissolved', notificationData);
          this.logger.debug(
            `Emitted groupDissolved directly to socket ${socket.id}`,
          );
        }
      } else {
        this.logger.debug(
          `No sockets found for user ${userId} in userSockets map`,
        );
      }

      // Phương pháp 2: Gửi đến phòng cá nhân của người dùng
      this.server.to(`user:${userId}`).emit('groupDissolved', notificationData);
      this.logger.debug(`Emitted groupDissolved to room user:${userId}`);

      // Phương pháp 3: Gửi đến tất cả client để client tự lọc
      // Chỉ sử dụng trong trường hợp khẩn cấp khi các phương pháp khác không hoạt động
      this.server.emit('groupDissolvedBroadcast', {
        ...notificationData,
        targetUserId: userId, // Thêm trường này để client có thể lọc
      });
      this.logger.debug(
        `Broadcast groupDissolvedBroadcast to all clients with targetUserId=${userId}`,
      );

      // Gửi thêm sự kiện updateConversationList để đảm bảo frontend cập nhật danh sách
      this.server.to(`user:${userId}`).emit('updateConversationList', {
        action: 'group_dissolved',
        groupId: data.groupId,
        groupName: data.groupName,
        timestamp: data.timestamp || new Date(),
      });
    }
  }

  /**
   * Notify a user directly that they have been added to a group
   * @param userId User ID to notify
   * @param data Group data
   */
  notifyUserAddedToGroup(userId: string, data: Record<string, any>): void {
    // Emit to user's personal room
    this.server.to(`user:${userId}`).emit('addedToGroup', data);

    // Also try to emit directly to user's sockets as a fallback
    const userSockets = this.userSockets.get(userId);
    if (userSockets && userSockets.size > 0) {
      for (const socket of userSockets) {
        socket.emit('addedToGroup', data);
      }
      this.logger.debug(
        `Notified user ${userId} about being added to group ${data.groupId}`,
      );
    }
  }

  /**
   * Notify a user directly that they have been removed from a group
   * @param userId User ID to notify
   * @param data Group data
   */
  notifyUserRemovedFromGroup(userId: string, data: Record<string, any>): void {
    // Emit to user's personal room
    this.server.to(`user:${userId}`).emit('removedFromGroup', data);

    // Also try to emit directly to user's sockets as a fallback
    const userSockets = this.userSockets.get(userId);
    if (userSockets && userSockets.size > 0) {
      for (const socket of userSockets) {
        socket.emit('removedFromGroup', data);
      }
      this.logger.debug(
        `Notified user ${userId} about being removed from group ${data.groupId}`,
      );
    }

    // Emit updateGroupList event to ensure frontend updates the group list
    this.server.to(`user:${userId}`).emit('updateGroupList', {
      action: 'removed_from_group',
      groupId: data.groupId,
      removedById: data.removedById,
      kicked: data.kicked,
      left: data.left,
      timestamp: data.timestamp || new Date(),
    });
  }
}

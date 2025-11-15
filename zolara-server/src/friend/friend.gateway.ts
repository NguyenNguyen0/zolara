import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  namespace: '/friends',
  cors: {
    origin: true, // Sử dụng true thay vì '*' để tương thích với cài đặt CORS của ứng dụng
    credentials: true,
  },
  pingInterval: 30000, // 30 seconds
  pingTimeout: 30000, // 30 seconds
  transports: ['websocket', 'polling'], // Hỗ trợ cả WebSocket và polling để tăng độ tin cậy
  allowUpgrades: true, // Cho phép nâng cấp từ polling lên websocket
  connectTimeout: 60000, // Tăng thời gian timeout kết nối lên 60 giây
  maxHttpBufferSize: 1e8, // Tăng kích thước buffer cho các tin nhắn lớn (100MB)
})
export class FriendGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('FriendGateway');
  private userSockets: Map<string, Set<Socket>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private async getUserFromSocket(client: Socket): Promise<string | null> {
    try {
      const token = client.handshake.auth.token;
      if (!token) return null;

      const decoded = this.jwtService.verify(token);
      return decoded.sub;
    } catch (error) {
      this.logger.error('Error verifying token:', error);
      return null;
    }
  }

  private addUserSocket(userId: string, socket: Socket) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket);
  }

  private removeUserSocket(userId: string, socket: Socket) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.delete(socket);
      if (userSockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  async handleConnection(client: Socket) {
    const userId = await this.getUserFromSocket(client);
    if (!userId) {
      client.disconnect();
      return;
    }

    this.addUserSocket(userId, client);

    // Join user's personal room
    client.join(`user:${userId}`);

    this.logger.log(`User ${userId} connected to friend gateway`);
  }

  handleDisconnect(client: Socket) {
    this.getUserFromSocket(client).then((userId) => {
      if (userId) {
        this.removeUserSocket(userId, client);
        this.logger.log(`User ${userId} disconnected from friend gateway`);
      }
    });
  }

  /**
   * Emit a reload event to both users involved in a relationship change
   * @param senderId The ID of the user who initiated the action
   * @param receiverId The ID of the user who is the target of the action
   */
  emitReloadEvent(senderId: string, receiverId: string) {
    // Emit simple reload event to both users' rooms
    this.server.to(`user:${senderId}`).emit('reload');
    this.server.to(`user:${receiverId}`).emit('reload');

    // Log detailed information for debugging
    this.logger.debug(
      `Emitting reload event to users ${senderId} and ${receiverId}`,
    );
    this.logger.debug(`Active user sockets: ${this.userSockets.size}`);

    // Also try to emit directly to the sockets if they exist
    const senderSockets = this.userSockets.get(senderId);
    const receiverSockets = this.userSockets.get(receiverId);

    if (senderSockets && senderSockets.size > 0) {
      senderSockets.forEach((socket) => socket.emit('reload'));
      this.logger.debug(
        `Emitted directly to ${senderSockets.size} sender sockets`,
      );
    }

    if (receiverSockets && receiverSockets.size > 0) {
      receiverSockets.forEach((socket) => socket.emit('reload'));
      this.logger.debug(
        `Emitted directly to ${receiverSockets.size} receiver sockets`,
      );
    }

    this.logger.log(
      `Emitted reload event to users ${senderId} and ${receiverId}`,
    );
  }
}

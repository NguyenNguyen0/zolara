import { Server, Socket } from 'socket.io';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type UserData = {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  fullName: string | null;
  profilePictureUrl?: string | null;
};

interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: UserData;
  device: {
    id: string;
    name: string | null;
    type: string;
  };
}

@Injectable()
@WebSocketGateway({
  namespace: '/qr-code',
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
export class QrCodeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger('QrCodeGateway');

  // Map to track active connections by QR token
  private qrConnections: Map<string, Set<Socket>> = new Map();

  handleConnection(client: Socket): void {
    // Extract QR token from connection query params if available
    const qrToken = client.handshake.query.qrToken as string;

    if (qrToken) {
      // Store the connection
      if (!this.qrConnections.has(qrToken)) {
        this.qrConnections.set(qrToken, new Set());
      }
      this.qrConnections.get(qrToken).add(client);
      this.logger.debug(`Client connected to QR code ${qrToken}`);
    }
  }

  handleDisconnect(client: Socket): void {
    // Remove the connection from our tracking
    this.qrConnections.forEach((clients, qrToken) => {
      if (clients.has(client)) {
        clients.delete(client);
        this.logger.debug(`Client disconnected from QR code ${qrToken}`);

        // Clean up empty sets
        if (clients.size === 0) {
          this.qrConnections.delete(qrToken);
        }
      }
    });
  }

  sendQrStatus(
    qrToken: string,
    status: string,
    userData?: UserData,
    loginData?: LoginData,
  ): void {
    this.server.emit(`qr-status-${qrToken}`, {
      status,
      userData,
      loginData,
    });
  }

  /**
   * Close all socket connections for a specific QR code
   * @param qrToken The QR token to close connections for
   */
  closeQrConnections(qrToken: string): void {
    const connections = this.qrConnections.get(qrToken);

    if (connections && connections.size > 0) {
      this.logger.debug(
        `Closing ${connections.size} connections for QR code ${qrToken}`,
      );

      // Notify clients before disconnecting
      this.sendQrStatus(qrToken, 'EXPIRED');

      // Close each connection
      connections.forEach((socket) => {
        socket.disconnect(true);
      });

      // Remove from tracking
      this.qrConnections.delete(qrToken);
    }
  }

  /**
   * Close all socket connections for multiple QR codes
   * @param qrTokens Array of QR tokens to close connections for
   */
  closeMultipleQrConnections(qrTokens: string[]): void {
    qrTokens.forEach((token) => this.closeQrConnections(token));
  }
}

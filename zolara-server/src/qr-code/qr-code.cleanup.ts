// src/tasks/qr-code.cleanup.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { QrCodeGateway } from './qr-code.gateway';

@Injectable()
export class QrCodeCleanupTask {
  private readonly logger = new Logger(QrCodeCleanupTask.name);

  constructor(
    private prisma: PrismaService,
    private qrCodeGateway: QrCodeGateway,
  ) {}

  @Cron('*/30 * * * *') // Chạy mỗi 30 phút
  async handleCron() {
    const now = new Date();

    // Lấy danh sách các mã QR đã hết hạn trước khi xóa
    const expiredQrCodes = await this.prisma.qrCode.findMany({
      where: { expiresAt: { lt: now } },
      select: { qrToken: true },
    });

    // Lấy danh sách các token để đóng kết nối
    const expiredTokens = expiredQrCodes.map((qr) => qr.qrToken);

    // Đóng các kết nối WebSocket cho các mã QR đã hết hạn
    if (expiredTokens.length > 0) {
      this.logger.debug(
        `Closing WebSocket connections for ${expiredTokens.length} expired QR codes`,
      );
      this.qrCodeGateway.closeMultipleQrConnections(expiredTokens);
    }

    // Xóa các mã QR đã hết hạn
    const result = await this.prisma.qrCode.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    this.logger.debug(`Deleted ${result.count} expired QR Codes.`);
  }
}

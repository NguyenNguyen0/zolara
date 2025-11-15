import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QrCodeGateway } from './qr-code.gateway';
import { QrCodeStatus } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QrCodeService {
  constructor(
    private prisma: PrismaService,
    private qrCodeGateway: QrCodeGateway,
    private authService: AuthService,
  ) {}

  async generateQrCode() {
    const qrToken = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const qrCode = await this.prisma.qrCode.create({
      data: {
        qrToken,
        status: QrCodeStatus.PENDING,
        expiresAt,
      },
    });

    return { qrToken: qrCode.qrToken, expires_in: 300 };
  }

  async getQrStatus(qrToken: string) {
    const qrCode = await this.findAndValidateQrCode(qrToken);
    return { status: qrCode.status };
  }

  async scanQrCode(qrToken: string, userId: string) {
    // Validate the QR token exists and is valid
    const qrCode = await this.findAndValidateQrCode(qrToken);

    if (qrCode.status !== QrCodeStatus.PENDING) {
      throw new BadRequestException('QR Code has already been used');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userInfo: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Make sure we're using the qrToken from the validated qrCode object
    try {
      const updatedQrCode = await this.prisma.qrCode.update({
        where: { id: qrCode.id },
        data: { status: QrCodeStatus.SCANNED, userId },
      });
    } catch (error) {
      console.error('Error updating QR code status:', error);
    }

    const userData = {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      fullName: user.userInfo?.fullName,
      profilePictureUrl: user.userInfo?.profilePictureUrl,
    };

    this.qrCodeGateway.sendQrStatus(
      qrCode.qrToken,
      QrCodeStatus.SCANNED,
      userData,
    );

    return {
      status: QrCodeStatus.SCANNED,
      user: userData,
    };
  }

  async confirmQrCode(qrToken: string, userId: string) {
    const qrCode = await this.findAndValidateQrCode(qrToken);

    if (qrCode.status !== QrCodeStatus.SCANNED) {
      throw new BadRequestException('QR Code has not been scanned');
    }

    if (qrCode.userId !== userId) {
      throw new BadRequestException('Unauthorized to confirm this QR Code');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userInfo: true },
    });

    const { accessToken, refreshToken } = await this.authService.generateTokens(
      user.id,
      {
        deviceType: 'WEB',
        deviceName: 'QR Code Login',
      },
    );

    const deviceInfo = {
      id: uuidv4(),
      name: 'QR Code Login',
      type: 'WEB',
    };

    try {
      const updatedQrCode = await this.prisma.qrCode.update({
        where: { id: qrCode.id },
        data: { status: QrCodeStatus.CONFIRMED },
      });
    } catch (error) {
      throw new Error(
        `Failed to update QR code status to CONFIRMED: ${error.message}`,
      );
    }

    const loginData = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: user.userInfo?.fullName,
        profilePictureUrl: user.userInfo?.profilePictureUrl,
      },
      device: deviceInfo,
    };

    this.qrCodeGateway.sendQrStatus(
      qrCode.qrToken,
      QrCodeStatus.CONFIRMED,
      undefined,
      loginData,
    );

    await this.deleteQrCode(qrCode.qrToken);
    return { status: QrCodeStatus.CONFIRMED };
  }

  async cancelQrCode(qrToken: string) {
    const qrCode = await this.findAndValidateQrCode(qrToken);

    try {
      const updatedQrCode = await this.prisma.qrCode.update({
        where: { id: qrCode.id },
        data: { status: QrCodeStatus.CANCELLED },
      });
    } catch (error) {
      throw new Error(
        `Failed to update QR code status to CANCELLED: ${error.message}`,
      );
    }

    this.qrCodeGateway.sendQrStatus(qrCode.qrToken, QrCodeStatus.CANCELLED);
    await this.deleteQrCode(qrCode.qrToken);

    return { status: QrCodeStatus.CANCELLED };
  }

  private async findAndValidateQrCode(qrToken: string) {
    // Check if qrToken is undefined or empty
    if (!qrToken) {
      throw new BadRequestException('QR token is required');
    }

    try {
      // Use findFirst instead of findUnique to avoid Prisma validation errors
      const qrCode = await this.prisma.qrCode.findFirst({
        where: {
          qrToken: qrToken,
        },
      });

      if (!qrCode) {
        throw new NotFoundException('QR Code not found');
      }

      // Kiểm tra thời hạn QR code
      if (new Date() > qrCode.expiresAt) {
        throw new BadRequestException('QR Code has expired');
      }

      return qrCode;
    } catch (error) {
      console.error('Error finding QR code:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error; // Re-throw application exceptions
      }
      throw new NotFoundException(`QR Code not found: ${error.message}`);
    }
  }

  private async deleteQrCode(qrToken: string) {
    if (!qrToken) {
      console.warn('Attempted to delete QR code with undefined token');
      return;
    }

    try {
      // First find the QR code
      const qrCode = await this.prisma.qrCode.findFirst({
        where: { qrToken },
      });

      if (!qrCode) {
        console.warn(`QR code with token ${qrToken} not found for deletion`);
        return;
      }

      // Close any active WebSocket connections for this QR code
      this.qrCodeGateway.closeQrConnections(qrToken);

      // Then delete it by ID which is the primary key
      const deletedQrCode = await this.prisma.qrCode.delete({
        where: { id: qrCode.id },
      });
    } catch (error) {
      console.error('Error deleting QR code:', error);
      // Don't throw the error as this is a cleanup operation
    }
  }
}

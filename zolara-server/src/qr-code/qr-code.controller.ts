// src/qr-code/qr-code.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Logger,
  Request,
} from '@nestjs/common';
import { QrCodeService } from './qr-code.service';
import { Public } from 'src/auth/public.decorator';
import { ScanFriendQrDto } from './dto/friend-qr.dto';

@Controller('qrcode')
export class QrCodeController {
  private readonly logger = new Logger('QrCodeController');

  constructor(private qrCodeService: QrCodeService) {}

  @Public()
  @Post('generate')
  async generateQrCode() {
    return this.qrCodeService.generateQrCode();
  }

  @Public()
  @Get('status/:qrToken')
  async getQrStatus(@Param('qrToken') qrToken: string) {
    return this.qrCodeService.getQrStatus(qrToken);
  }

  @Post('scan')
  async scanQrCode(@Body('qrToken') qrToken: string, @Request() req: Request) {
    this.logger.log(`Scanning QR code with token: ${qrToken}`);
    const userId = req['user'].sub;
    this.logger.log(`User ID from request: ${userId}`);
    return this.qrCodeService.scanQrCode(qrToken, userId);
  }

  @Post('confirm')
  async confirmQrCode(
    @Request() req: Request,
    @Body('qrToken') qrToken: string,
  ) {
    this.logger.log(`Confirming QR code with token: ${qrToken}`);
    const userId = req['user'].sub;
    this.logger.log(`User ID from request: ${userId}`);
    return this.qrCodeService.confirmQrCode(qrToken, userId);
  }

  @Post('cancel')
  async cancelQrCode(@Body('qrToken') qrToken: string) {
    this.logger.log(`Cancelling QR code with token: ${qrToken}`);
    return this.qrCodeService.cancelQrCode(qrToken);
  }
}

import { Module } from '@nestjs/common';
import { QrCodeService } from './qr-code.service';
import { QrCodeGateway } from './qr-code.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { QrCodeController } from './qr-code.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { QrCodeCleanupTask } from './qr-code.cleanup';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), AuthModule],
  controllers: [QrCodeController],
  providers: [QrCodeGateway, QrCodeService, QrCodeCleanupTask],
  exports: [QrCodeService],
})
export class QrCodeModule {}

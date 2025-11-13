import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { PrismaCleanupService } from './prisma-cleanup.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [PrismaService, PrismaCleanupService],
  exports: [PrismaService],
})
export class PrismaModule {}

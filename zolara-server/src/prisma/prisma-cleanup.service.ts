import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaCleanupService {
  private readonly logger = new Logger(PrismaCleanupService.name);

  constructor(private readonly prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleDatabaseCleanup() {
    this.logger.log('Running database connection cleanup...');
    await this.prismaService.cleanUp();
  }
}

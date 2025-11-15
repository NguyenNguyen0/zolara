import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Define interfaces for event handlers to fix type issues
interface QueryEvent {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
}

interface ErrorEvent {
  message: string;
  target: string;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 5000; // 5 seconds

  constructor() {
    super({
      log: ['error', 'warn'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Connecting to database...');
      await this.$connect();
      this.logger.log('Successfully connected to database');

      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;

      // We need to use any type here because PrismaClient's $on method has limited type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).$on('query', (event: QueryEvent) => {
        if (event.duration > 1000) {
          // Log slow queries (over 1 second)
          this.logger.warn(
            `Slow query detected: ${event.query} (${event.duration}ms)`,
          );
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).$on('error', (event: ErrorEvent) => {
        this.logger.error(`Database error: ${event.message}`);
        this.handleDisconnect();
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to connect to database: ${errorMessage}`);
      this.handleDisconnect();
    }
  }

  private async handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.logger.warn(
        `Attempting to reconnect to database (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      );

      setTimeout(async () => {
        try {
          await this.$disconnect();
          await this.$connect();
          this.logger.log('Successfully reconnected to database');
          this.reconnectAttempts = 0;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Failed to reconnect to database: ${errorMessage}`);
          this.handleDisconnect();
        }
      }, this.reconnectInterval);
    } else {
      this.logger.error(
        `Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Unable to connect to database.`,
      );
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Successfully disconnected from database');
  }

  // Helper method to clean up connections
  async cleanUp() {
    try {
      // Execute a query to terminate idle connections
      // This is PostgreSQL specific
      await this.$executeRaw`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = current_database()
        AND pid <> pg_backend_pid()
        AND state = 'idle'
        AND state_change < current_timestamp - INTERVAL '30 minutes'
      `;
      this.logger.log('Successfully cleaned up idle database connections');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to clean up database connections: ${errorMessage}`,
      );
    }
  }
}

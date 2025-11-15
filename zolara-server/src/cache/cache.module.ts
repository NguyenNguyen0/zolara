import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createClient } from 'redis';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const client = createClient({
          url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
        });
        await client.connect();
        return {
          store: client as any,
          ttl: 60000, // 60 seconds default TTL
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisCacheModule {}

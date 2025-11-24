import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createClient } from 'redis';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        let client;
        
        // Use REDIS_URL if provided (Railway format), otherwise use individual config
        if (process.env.REDIS_URL) {
          console.log('Connecting to Redis using REDIS_URL');
          client = createClient({
            url: process.env.REDIS_URL,
          });
        } else {
          console.log('Connecting to Redis using individual config');
          const redisConfig: any = {
            socket: {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379'),
            },
          };

          // Add password if provided
          if (process.env.REDIS_PASSWORD) {
            redisConfig.password = process.env.REDIS_PASSWORD;
          }

          client = createClient(redisConfig);
        }
        
        client.on('error', (err) => console.error('Redis Client Error', err));
        client.on('connect', () => console.log('Redis Client Connected'));
        
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

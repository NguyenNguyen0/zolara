import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { GroupModule } from './group/group.module';
import { QrCodeModule } from './qr-code/qr-code.module';
import { MessageModule } from './message/message.module';
import { StorageModule } from './storage/storage.module';
import { FriendModule } from './friend/friend.module';
import { ContactModule } from './contact/contact.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventModule,
    UserModule,
    PrismaModule,
    AuthModule,
    QrCodeModule,
    GroupModule,
    MessageModule,
    StorageModule,
    FriendModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

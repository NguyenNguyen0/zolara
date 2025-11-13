import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { FriendStatus } from '@prisma/client';

export class RespondFriendRequestDto {
  @IsNotEmpty()
  @IsUUID()
  requestId: string;

  @IsNotEmpty()
  @IsEnum(FriendStatus, {
    message: 'Status must be either ACCEPTED, DECLINED, or BLOCKED',
  })
  status: FriendStatus;
}

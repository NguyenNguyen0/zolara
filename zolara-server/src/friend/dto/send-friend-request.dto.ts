import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendFriendRequestDto {
  @IsNotEmpty()
  @IsUUID()
  receiverId: string;

  @IsOptional()
  @IsString()
  introduce?: string;
}

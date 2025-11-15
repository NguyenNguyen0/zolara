import { IsUUID } from 'class-validator';
import { BaseCreateMessageDto } from './base-message.dto';

export class UserMessageDto extends BaseCreateMessageDto {
  @IsUUID()
  receiverId: string;
}

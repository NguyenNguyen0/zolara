import { IsUUID } from 'class-validator';
import { BaseCreateMessageDto } from './base-message.dto';

export class GroupMessageDto extends BaseCreateMessageDto {
  @IsUUID()
  groupId: string;
}

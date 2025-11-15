import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MediaType } from './base-message.dto';
import { MediaItem } from '../interfaces/message.interface';

export class MessageMediaUploadDto {
  @IsUUID()
  messageId?: string;

  @IsOptional()
  @IsUUID()
  senderId?: string;

  @IsOptional()
  @IsUUID()
  receiverId?: string;

  @IsOptional()
  @IsUUID()
  groupId?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsEnum(MediaType)
  mediaType: MediaType;
}

export class MessageMediaProcessingResult {
  messageId: string;
  mediaItems: MediaItem[];
  success: boolean;
  error?: string;
}

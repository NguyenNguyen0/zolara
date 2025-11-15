import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}

export class MediaItemDto {
  @IsString()
  url: string;

  @IsEnum(MediaType)
  type: MediaType;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class MessageContentDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaItemDto)
  media?: MediaItemDto[] = [];
}

export class BaseCreateMessageDto {
  @Type(() => MessageContentDto)
  @ValidateNested()
  content: MessageContentDto;

  @IsUUID()
  @IsOptional()
  repliedTo?: string;

  @IsUUID()
  @IsOptional()
  senderId?: string;
}

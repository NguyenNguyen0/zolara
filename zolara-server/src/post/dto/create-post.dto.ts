import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum PrivacyLevel {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private',
}

export class MediaItemDto {
  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  type?: string; // image, video, etc.

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class CreatePostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaItemDto)
  @Transform(({ value }) => {
    // If value is a string (JSON from FormData), parse it
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  media?: MediaItemDto[];

  @IsEnum(PrivacyLevel)
  @IsOptional()
  privacyLevel?: PrivacyLevel = PrivacyLevel.PUBLIC;
}


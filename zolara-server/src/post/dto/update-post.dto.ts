import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PrivacyLevel, MediaItemDto } from './create-post.dto';

export class UpdatePostDto {
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
  privacyLevel?: PrivacyLevel;
}


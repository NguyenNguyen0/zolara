import { IsUUID, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ForwardTarget {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsUUID()
  @IsOptional()
  groupId?: string;
}

export class ForwardMessageDto {
  @IsUUID()
  messageId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ForwardTarget)
  targets: ForwardTarget[];
}

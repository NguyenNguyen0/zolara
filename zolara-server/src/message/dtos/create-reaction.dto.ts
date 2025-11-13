import { ReactionType } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class CreateReactionDto {
  @IsUUID()
  messageId: string;

  @IsEnum(ReactionType)
  reaction: ReactionType;

  userId: string;
}

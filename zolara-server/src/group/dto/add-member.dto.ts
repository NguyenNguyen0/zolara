import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { GroupRole } from '@prisma/client';

export class AddMemberDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  groupId: string;

  @IsNotEmpty()
  @IsUUID()
  addedById: string;

  @IsEnum(GroupRole)
  role: GroupRole = GroupRole.MEMBER;
}

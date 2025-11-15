import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ArrayMinSize,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InitialMemberDto } from './initial-members.dto';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID()
  creatorId: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialMemberDto)
  @ArrayMinSize(2, {
    message:
      'Group must have at least 2 additional members (3 total including creator)',
  })
  initialMembers: InitialMemberDto[];
}

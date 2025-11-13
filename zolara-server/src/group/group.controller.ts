import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Request,
  UseInterceptors,
  UploadedFile,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GroupService } from './group.service';
import {
  CreateGroupDto,
  UpdateGroupDto,
  AddMemberDto,
  JoinGroupDto,
  GroupInfoDto,
} from './dto';
import { GroupRole } from '@prisma/client';

@Controller('groups')
export class GroupController {
  private readonly logger = new Logger(GroupController.name);

  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() body: Record<string, any>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Tạo đối tượng DTO từ dữ liệu form
    const createGroupDto = new CreateGroupDto();
    createGroupDto.name = body.name;
    createGroupDto.creatorId = body.creatorId;
    createGroupDto.avatarUrl = body.avatarUrl;

    // Xử lý trường initialMembers
    if (typeof body.initialMembers === 'string') {
      try {
        createGroupDto.initialMembers = JSON.parse(body.initialMembers);
      } catch (error) {
        this.logger.error(`Failed to parse initialMembers: ${error.message}`);
        throw new BadRequestException('Invalid initialMembers format');
      }
    } else if (Array.isArray(body.initialMembers)) {
      createGroupDto.initialMembers = body.initialMembers;
    } else {
      throw new BadRequestException('initialMembers is required');
    }

    this.logger.log(
      `Create group request - Name: ${createGroupDto.name}, CreatorId: ${createGroupDto.creatorId}, FileSize: ${file?.size || 'N/A'}, InitialMembers: ${JSON.stringify(createGroupDto.initialMembers)}`,
    );

    return this.groupService.create(createGroupDto, file);
  }

  @Get('user')
  findUserGroups(@Request() req: Request) {
    const currentUserId = req['user'].sub;
    return this.groupService.findUserGroups(currentUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    return this.groupService.update(id, updateGroupDto, requestUserId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req: Request) {
    const requestUserId = req['user'].sub;
    return this.groupService.remove(id, requestUserId);
  }

  @Post('members')
  addMember(@Body() addMemberDto: AddMemberDto) {
    return this.groupService.addMember(addMemberDto);
  }

  @Delete(':groupId/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param('groupId') groupId: string,
    @Param('userId') removeUserId: string,
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    return this.groupService.removeMember(groupId, removeUserId, requestUserId);
  }

  /**
   * Kick a member from the group with permission checks
   * - Only LEADER can kick CO_LEADER
   * - LEADER and CO_LEADER can kick regular MEMBER
   * @param groupId Group ID
   * @param userId User ID to kick
   * @param req Request object
   */
  @Post(':groupId/members/:userId/kick')
  @HttpCode(HttpStatus.NO_CONTENT)
  kickMember(
    @Param('groupId') groupId: string,
    @Param('userId') kickUserId: string,
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    this.logger.log(
      `Kick member request - GroupId: ${groupId}, KickUserId: ${kickUserId}, RequestUserId: ${requestUserId}`,
    );
    return this.groupService.kickMember(groupId, kickUserId, requestUserId);
  }

  @Patch(':groupId/members/:userId/role')
  updateMemberRole(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Body('role') role: GroupRole,
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    return this.groupService.updateMemberRole(
      groupId,
      userId,
      role,
      requestUserId,
    );
  }

  /**
   * Leave a group with permission checks
   * - Group leader cannot leave the group (must transfer leadership first)
   * @param groupId Group ID
   * @param req Request object containing user information
   */
  @Post(':groupId/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  leaveGroup(@Param('groupId') groupId: string, @Request() req: Request) {
    const userId = req['user'].sub;
    this.logger.log(
      `Leave group request - GroupId: ${groupId}, UserId: ${userId}`,
    );
    return this.groupService.leaveGroup(groupId, userId);
  }

  /**
   * Dissolve a group (delete it completely)
   * - Only the group leader can dissolve a group
   * - All members will be removed and the group will be deleted
   * @param groupId Group ID
   * @param req Request object containing user information
   */
  @Post(':groupId/dissolve')
  @HttpCode(HttpStatus.NO_CONTENT)
  dissolveGroup(@Param('groupId') groupId: string, @Request() req: Request) {
    const requestUserId = req['user'].sub;
    this.logger.log(
      `Dissolve group request - GroupId: ${groupId}, RequestUserId: ${requestUserId}`,
    );
    return this.groupService.dissolveGroup(groupId, requestUserId);
  }

  /**
   * Join a group via link
   * @param joinGroupDto Group join data
   * @param req Request object
   * @returns Group member
   */
  @Post('join')
  joinGroup(@Body() joinGroupDto: JoinGroupDto, @Request() req: Request) {
    const userId = req['user'].sub;
    this.logger.log(
      `Join group request - GroupId: ${joinGroupDto.groupId}, UserId: ${userId}`,
    );
    return this.groupService.joinGroupViaLink(joinGroupDto.groupId, userId);
  }

  /**
   * Get public group info (no authentication required)
   * @param id Group ID
   * @returns Group info
   */
  @Get(':id/info')
  @HttpCode(HttpStatus.OK)
  getPublicGroupInfo(@Param('id') id: string): Promise<GroupInfoDto> {
    return this.groupService.getPublicGroupInfo(id);
  }

  /**
   * Upload and update group avatar
   * @param groupId Group ID
   * @param file Avatar file
   * @param req Request object
   * @returns Updated group
   */
  @Patch(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateGroupAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    this.logger.log(
      `Update group avatar request - GroupId: ${id}, UserId: ${requestUserId}, FileSize: ${file?.size || 'N/A'}`,
    );
    return this.groupService.updateGroupAvatar(id, file, requestUserId);
  }
}

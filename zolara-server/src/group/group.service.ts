import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { Group, GroupMember, GroupRole } from '@prisma/client';
import {
  CreateGroupDto,
  UpdateGroupDto,
  AddMemberDto,
  GroupInfoDto,
} from './dto';
import { GroupGateway } from './group.gateway';
import { EventService } from '../event/event.service';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);
  private readonly GROUP_AVATARS_BUCKET = 'group-avatars';

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly groupGateway: GroupGateway,
    private readonly eventService: EventService,
  ) {}

  async create(
    createGroupDto: CreateGroupDto,
    file?: Express.Multer.File,
  ): Promise<Group> {
    let avatarUrl = createGroupDto.avatarUrl;

    // Upload avatar file if provided
    if (file) {
      // Check file type
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException(
          'Only image files are allowed for group avatars',
        );
      }

      try {
        // Upload the file
        const [fileData] = await this.storageService.uploadFiles(
          [file],
          this.GROUP_AVATARS_BUCKET,
          'temp',
        );

        // Use the uploaded file URL
        avatarUrl = fileData.url;
      } catch (error) {
        this.logger.error(`Failed to upload group avatar: ${error.message}`);
        throw new BadRequestException(
          `Failed to upload group avatar: ${error.message}`,
        );
      }
    }

    // Tạo nhóm với người tạo là thành viên đầu tiên (LEADER)
    const group = await this.prisma.group.create({
      data: {
        name: createGroupDto.name,
        creatorId: createGroupDto.creatorId,
        avatarUrl: avatarUrl,
        members: {
          create: {
            userId: createGroupDto.creatorId,
            role: GroupRole.LEADER,
            addedById: createGroupDto.creatorId,
          },
        },
      },
      include: {
        members: true,
      },
    });

    // If we uploaded a file, move it to the correct folder with the group ID
    if (file && group.id && avatarUrl) {
      try {
        // Extract the filename from the URL
        const fileName = new URL(avatarUrl).pathname.split('/').pop();
        if (!fileName) {
          throw new Error('Failed to extract filename from URL');
        }

        // Create a new path with the group ID (used for organization)

        // Get the file from the temp location
        const tempPath = `temp/${fileName}`;

        // Upload the file to the new location
        const [newFile] = await this.storageService.uploadFiles(
          [file],
          this.GROUP_AVATARS_BUCKET,
          group.id,
        );

        // Update the group with the new avatar URL
        await this.prisma.group.update({
          where: { id: group.id },
          data: { avatarUrl: newFile.url },
        });

        // Update the group object with the new URL
        group.avatarUrl = newFile.url;

        // Delete the temporary file
        try {
          await this.storageService.deleteFile(
            tempPath,
            this.GROUP_AVATARS_BUCKET,
          );
        } catch (error) {
          // Just log the error, don't fail the operation
          this.logger.warn(`Failed to delete temporary file: ${error.message}`);
        }
      } catch (error) {
        this.logger.error(`Failed to move group avatar: ${error.message}`);
        // Don't throw an error here, we already have the group created
      }
    }

    // Thêm các thành viên ban đầu vào nhóm
    if (
      createGroupDto.initialMembers &&
      createGroupDto.initialMembers.length > 0
    ) {
      const memberCreations = createGroupDto.initialMembers.map((member) => {
        return this.prisma.groupMember.create({
          data: {
            groupId: group.id,
            userId: member.userId,
            role: GroupRole.MEMBER,
            addedById: member.addedById || createGroupDto.creatorId,
          },
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        });
      });

      // Thực hiện tạo tất cả các thành viên cùng lúc
      await Promise.all(memberCreations);

      // Lấy lại nhóm với danh sách thành viên đã cập nhật
      const updatedGroup = await this.prisma.group.findUnique({
        where: { id: group.id },
        include: {
          members: true,
        },
      });

      // Thông báo qua GroupGateway cho mỗi thành viên được thêm vào
      for (const member of createGroupDto.initialMembers) {
        this.groupGateway.notifyMemberAdded(group.id, {
          groupId: group.id,
          member: { userId: member.userId, groupId: group.id } as any,
          addedBy: member.addedById || createGroupDto.creatorId,
          timestamp: new Date(),
        });

        // Phát sự kiện để MessageGateway cập nhật room
        this.eventService.emitGroupMemberAdded(
          group.id,
          member.userId,
          member.addedById || createGroupDto.creatorId,
        );
      }

      return updatedGroup;
    }

    return group;
  }

  async findAll(): Promise<Group[]> {
    return this.prisma.group.findMany({
      include: {
        members: true,
      },
    });
  }

  async findOne(id: string): Promise<any> {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              include: {
                userInfo: true,
              },
            },
            addedBy: {
              include: {
                userInfo: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Chuyển đổi dữ liệu trước khi trả về
    const formattedGroup = {
      ...group,
      members: group.members.map((member) => ({
        id: member.id,
        groupId: member.groupId,
        userId: member.userId,
        role: member.role,
        fullName: member.user?.userInfo?.fullName,
        profilePictureUrl: member.user?.userInfo?.profilePictureUrl,
        addedBy: member.addedById
          ? {
              id: member.addedById,
              fullName: member.addedBy?.userInfo?.fullName,
            }
          : null,
      })),
    };

    return formattedGroup;
  }

  /**
   * Get public group info by ID
   * @param id Group ID
   * @returns Group info
   */
  async getPublicGroupInfo(id: string): Promise<GroupInfoDto> {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Return only public information
    return {
      id: group.id,
      name: group.name,
      avatarUrl: group.avatarUrl,
      createdAt: group.createdAt,
      memberCount: group._count.members,
    };
  }

  async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
    requestUserId: string,
  ): Promise<Group> {
    await this.validateGroupAccess(id, requestUserId, 'update group details');

    try {
      const updatedGroup = await this.prisma.group.update({
        where: { id },
        data: updateGroupDto,
      });

      // Thông báo qua GroupGateway
      this.groupGateway.notifyGroupUpdated(id, {
        groupId: id,
        data: updateGroupDto,
        updatedBy: requestUserId,
        timestamp: new Date(),
      });

      // Phát sự kiện để cập nhật thông tin nhóm
      this.eventService.emitGroupUpdated(id, updateGroupDto, requestUserId);

      return updatedGroup;
    } catch (error) {
      throw new NotFoundException(`Failed to update group: ${error.message}`);
    }
  }

  async remove(id: string, requestUserId: string): Promise<Group> {
    await this.validateGroupAccess(id, requestUserId, 'delete groups');

    try {
      // First delete all group members
      await this.prisma.groupMember.deleteMany({
        where: { groupId: id },
      });

      // Then delete the group
      return await this.prisma.group.delete({
        where: { id },
      });
    } catch (_error) {
      throw new NotFoundException(`Group with ID ${id} not found ${_error}`);
    }
  }

  /**
   * Dissolve a group (delete it completely)
   * - Only the group leader can dissolve a group
   * - All members will be removed and the group will be deleted
   * @param groupId Group ID
   * @param requestUserId User ID making the request
   */
  async dissolveGroup(groupId: string, requestUserId: string): Promise<void> {
    // Get group with all members
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Find the requester's membership
    const requesterMembership = group.members.find(
      (member) => member.userId === requestUserId,
    );

    // Check if requester is a member
    if (!requesterMembership) {
      throw new ForbiddenException(
        `User ${requestUserId} is not a member of group ${groupId}`,
      );
    }

    // Check if requester is the leader
    if (requesterMembership.role !== GroupRole.LEADER) {
      throw new ForbiddenException(
        'Only the group leader can dissolve the group',
      );
    }

    // Get all members before deletion for notification
    const allMembers = [...group.members];

    try {
      // First delete all group members
      await this.prisma.groupMember.deleteMany({
        where: { groupId },
      });

      // Then delete the group
      await this.prisma.group.delete({
        where: { id: groupId },
      });

      // Notify all members about the group dissolution
      for (const member of allMembers) {
        if (member.userId !== requestUserId) {
          // Don't notify the leader who dissolved the group
          // Thông báo qua GroupGateway
          this.groupGateway.notifyGroupDissolved({
            groupId,
            groupName: group.name,
            userId: member.userId,
            dissolvedBy: requestUserId,
            timestamp: new Date(),
          });
        }
      }

      // Phát sự kiện về việc giải tán nhóm với danh sách thành viên
      // Chuyển đổi danh sách thành viên sang định dạng cần thiết
      const membersList = allMembers.map((member) => ({
        userId: member.userId,
      }));
      this.eventService.emitGroupDissolved(
        groupId,
        group.name,
        requestUserId,
        membersList,
      );

      this.logger.log(
        `Group ${groupId} was dissolved by user ${requestUserId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to dissolve group ${groupId}: ${error.message}`,
      );
      throw new BadRequestException(
        `Failed to dissolve group: ${error.message}`,
      );
    }
  }

  async findUserGroups(userId: string): Promise<any[]> {
    const groups = await this.prisma.group.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              include: {
                userInfo: true,
              },
            },
            addedBy: {
              include: {
                userInfo: true,
              },
            },
          },
        },
      },
    });

    // Chuyển đổi dữ liệu trước khi trả về
    return groups.map((group) => ({
      ...group,
      members: group.members.map((member) => ({
        id: member.id,
        groupId: member.groupId,
        userId: member.userId,
        role: member.role,
        fullName: member.user?.userInfo?.fullName,
        profilePictureUrl: member.user?.userInfo?.profilePictureUrl,
        addedBy: member.addedById
          ? {
              id: member.addedById,
              fullName: member.addedBy?.userInfo?.fullName,
            }
          : null,
      })),
    }));
  }

  async addMember(addMemberDto: AddMemberDto): Promise<any> {
    const { groupId, userId, addedById, role } = addMemberDto;

    // Check if user is already a member
    const existingMember = await this.prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
      include: {
        user: {
          include: {
            userInfo: true,
          },
        },
        addedBy: {
          include: {
            userInfo: true,
          },
        },
      },
    });

    if (existingMember) {
      // Format existing member before returning
      return {
        id: existingMember.id,
        groupId: existingMember.groupId,
        userId: existingMember.userId,
        role: existingMember.role,
        fullName: existingMember.user?.userInfo?.fullName,
        profilePictureUrl: existingMember.user?.userInfo?.profilePictureUrl,
        addedBy: existingMember.addedById
          ? {
              id: existingMember.addedById,
              fullName: existingMember.addedBy?.userInfo?.fullName,
            }
          : null,
      };
    }

    const newMember = await this.prisma.groupMember.create({
      data: {
        groupId,
        userId,
        addedById,
        role,
      },
      include: {
        user: {
          include: {
            userInfo: true,
          },
        },
        addedBy: {
          include: {
            userInfo: true,
          },
        },
        group: true,
      },
    });

    // Format new member before returning
    const formattedMember = {
      id: newMember.id,
      groupId: newMember.groupId,
      userId: newMember.userId,
      role: newMember.role,
      fullName: newMember.user?.userInfo?.fullName,
      profilePictureUrl: newMember.user?.userInfo?.profilePictureUrl,
      addedBy: addedById
        ? {
            id: addedById,
            fullName: newMember.addedBy?.userInfo?.fullName,
          }
        : null,
    };

    // Thông báo qua GroupGateway
    this.groupGateway.notifyMemberAdded(groupId, {
      groupId,
      member: formattedMember,
      addedBy: addedById,
      timestamp: new Date(),
    });

    // Phát sự kiện để MessageGateway cập nhật room
    this.eventService.emitGroupMemberAdded(groupId, userId, addedById);

    return formattedMember;
  }

  async removeMember(
    groupId: string,
    userId: string,
    requestUserId: string,
  ): Promise<void> {
    await this.validateGroupAccess(groupId, requestUserId, 'remove members');

    await this.prisma.groupMember.deleteMany({
      where: {
        groupId,
        userId,
      },
    });

    // Thông báo qua GroupGateway
    this.groupGateway.notifyMemberRemoved(groupId, {
      groupId,
      userId,
      removedBy: requestUserId,
      timestamp: new Date(),
    });

    // Phát sự kiện để MessageGateway cập nhật room
    this.eventService.emitGroupMemberRemoved(
      groupId,
      userId,
      requestUserId,
      {},
    );
  }

  /**
   * Kick a member from the group with specific permission checks
   * - Only LEADER can kick CO_LEADER
   * - LEADER and CO_LEADER can kick regular MEMBER
   * @param groupId Group ID
   * @param kickUserId User ID to kick
   * @param requestUserId User ID making the request
   */
  async kickMember(
    groupId: string,
    kickUserId: string,
    requestUserId: string,
  ): Promise<void> {
    // Get group with all members
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Find the requester's membership
    const requesterMembership = group.members.find(
      (member) => member.userId === requestUserId,
    );

    // Find the target user's membership
    const targetMembership = group.members.find(
      (member) => member.userId === kickUserId,
    );

    // Check if both users are members
    if (!requesterMembership) {
      throw new ForbiddenException(
        `User ${requestUserId} is not a member of group ${groupId}`,
      );
    }

    if (!targetMembership) {
      throw new NotFoundException(
        `User ${kickUserId} is not a member of group ${groupId}`,
      );
    }

    // Check if user is trying to kick themselves
    if (requestUserId === kickUserId) {
      throw new BadRequestException(
        'You cannot kick yourself from the group. Use the leave group function instead.',
      );
    }

    // Check if target is the LEADER (cannot be kicked)
    if (targetMembership.role === GroupRole.LEADER) {
      throw new ForbiddenException('The group leader cannot be kicked');
    }

    // Apply permission rules
    // Rule 1: Only LEADER can kick CO_LEADER
    if (
      targetMembership.role === GroupRole.CO_LEADER &&
      requesterMembership.role !== GroupRole.LEADER
    ) {
      throw new ForbiddenException(
        'Only the group leader can kick a co-leader',
      );
    }

    // Rule 2: LEADER and CO_LEADER can kick regular MEMBER
    if (
      targetMembership.role === GroupRole.MEMBER &&
      requesterMembership.role !== GroupRole.LEADER &&
      requesterMembership.role !== GroupRole.CO_LEADER
    ) {
      throw new ForbiddenException(
        'Only group leaders and co-leaders can kick members',
      );
    }

    // All permission checks passed, proceed with kicking the member
    await this.prisma.groupMember.deleteMany({
      where: {
        groupId,
        userId: kickUserId,
      },
    });

    // Thông báo qua GroupGateway
    this.groupGateway.notifyMemberRemoved(groupId, {
      groupId,
      userId: kickUserId,
      removedBy: requestUserId,
      kicked: true, // Flag to indicate this was a kick, not a voluntary leave
      timestamp: new Date(),
    });

    // Phát sự kiện để MessageGateway cập nhật room
    this.eventService.emitGroupMemberRemoved(
      groupId,
      kickUserId,
      requestUserId,
      { kicked: true },
    );

    this.logger.log(
      `User ${kickUserId} was kicked from group ${groupId} by ${requestUserId}`,
    );
  }

  async updateMemberRole(
    groupId: string,
    userId: string,
    role: GroupRole,
    requestUserId: string,
  ): Promise<GroupMember> {
    // Validate the requester has leadership access and get leadership info
    const {
      group,
      userMembership: requesterMembership,
      leader,
    } = await this.validateGroupAccess(
      groupId,
      requestUserId,
      'update member role',
    );

    // Type assertion to ensure TypeScript recognizes members property
    const groupWithMembers = group as Group & { members: GroupMember[] };

    // Find the target user's membership
    const targetMembership = groupWithMembers.members.find(
      (member) => member.userId === userId,
    );

    if (!targetMembership) {
      throw new NotFoundException(
        `User ${userId} is not a member of group ${groupId}`,
      );
    }

    // Apply role assignment rules based on leadership hierarchy
    let finalRole = role;

    // Rule 1: Only LEADER can assign CO_LEADER role
    if (
      role === GroupRole.CO_LEADER &&
      requesterMembership.role !== GroupRole.LEADER
    ) {
      throw new ForbiddenException(
        'Only group leaders can assign co-leader role',
      );
    }

    // Rule 2: Handle LEADER role assignment
    if (role === GroupRole.LEADER) {
      // If there's already a leader and it's not the target user
      if (leader && leader.userId !== userId) {
        // If the requester is the current leader, it's a leadership transfer
        if (leader.userId === requestUserId) {
          // Step 1: Demote current leader to co-leader
          await this.prisma.groupMember.update({
            where: { id: leader.id },
            data: { role: GroupRole.MEMBER },
          });
          // Step 2: Allow target to become new leader
          finalRole = GroupRole.LEADER;
        } else {
          // If requester is not the current leader, convert to CO_LEADER instead
          finalRole = GroupRole.CO_LEADER;
        }
      }
    }

    // Apply the role change
    const updatedMember = await this.prisma.groupMember.update({
      where: { id: targetMembership.id },
      data: { role: finalRole },
    });

    // Thông báo qua GroupGateway
    this.groupGateway.notifyRoleChanged(groupId, {
      groupId,
      userId,
      role: finalRole,
      updatedBy: requestUserId,
      timestamp: new Date(),
    });

    // Phát sự kiện để cập nhật vai trò
    this.eventService.emitGroupRoleChanged(
      groupId,
      userId,
      finalRole.toString(),
      requestUserId,
    );

    return updatedMember;
  }

  /**
   * Validates if a user has leadership access to a group and returns group info with leadership details
   *
   * @param groupId The ID of the group
   * @param userId The ID of the user requesting access
   * @param operation The operation description for error messages
   * @returns Object containing the group, user membership, leader and co-leader information
   * @throws NotFoundException if the group doesn't exist
   * @throws ForbiddenException if the user is not a leader or co-leader
   */
  private async validateGroupAccess(
    groupId: string,
    userId: string,
    operation: string,
  ): Promise<{
    group: Group;
    userMembership: GroupMember;
    leader: GroupMember | undefined;
    coLeaders: GroupMember[];
  }> {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const userMembership = group.members.find(
      (member) => member.userId === userId,
    );

    const hasLeadershipRole =
      userMembership &&
      (userMembership.role === GroupRole.LEADER ||
        userMembership.role === GroupRole.CO_LEADER);

    if (!hasLeadershipRole) {
      throw new ForbiddenException(
        `Only group leaders and co-leaders can ${operation}`,
      );
    }

    // Find the leader and co-leaders for the group
    const leader = group.members.find(
      (member) => member.role === GroupRole.LEADER,
    );

    const coLeaders = group.members.filter(
      (member) => member.role === GroupRole.CO_LEADER,
    );

    return {
      group,
      userMembership,
      leader,
      coLeaders,
    };
  }

  /**
   * Join a group via link
   * @param groupId Group ID
   * @param userId User ID
   * @returns Group member
   */
  async joinGroupViaLink(groupId: string, userId: string): Promise<any> {
    // Check if group exists
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              include: {
                userInfo: true,
              },
            },
            addedBy: {
              include: {
                userInfo: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Check if user is already a member
    const existingMember = group.members.find(
      (member) => member.userId === userId,
    );

    if (existingMember) {
      // Format existing member before returning
      return {
        id: existingMember.id,
        groupId: existingMember.groupId,
        userId: existingMember.userId,
        role: existingMember.role,
        fullName: existingMember.user?.userInfo?.fullName,
        profilePictureUrl: existingMember.user?.userInfo?.profilePictureUrl,
        addedBy: existingMember.addedById
          ? {
              id: existingMember.addedById,
              fullName: existingMember.addedBy?.userInfo?.fullName,
            }
          : null,
      };
    }

    // Add user to the group as a regular member
    const newMember = await this.prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: GroupRole.MEMBER,
        addedById: userId, // Self-added via link
      },
      include: {
        user: {
          include: {
            userInfo: true,
          },
        },
        group: true,
      },
    });

    // Format new member before returning
    const formattedMember = {
      id: newMember.id,
      groupId: newMember.groupId,
      userId: newMember.userId,
      role: newMember.role,
      fullName: newMember.user?.userInfo?.fullName,
      profilePictureUrl: newMember.user?.userInfo?.profilePictureUrl,
      addedBy: null, // Self-added via link, so no addedBy
    };

    // Thông báo qua GroupGateway
    this.groupGateway.notifyMemberAdded(groupId, {
      groupId,
      member: formattedMember,
      addedBy: userId,
      joinedViaLink: true,
      timestamp: new Date(),
    });

    // Phát sự kiện để MessageGateway cập nhật room
    this.eventService.emitGroupMemberAdded(groupId, userId, userId);

    return formattedMember;
  }

  /**
   * Leave a group with permission checks
   * - Group leader cannot leave the group (must transfer leadership first)
   * @param groupId Group ID
   * @param userId User ID leaving the group
   */
  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const userMembership = group.members.find(
      (member) => member.userId === userId,
    );

    if (!userMembership) {
      throw new NotFoundException(
        `User ${userId} is not a member of group ${groupId}`,
      );
    }

    // Check if user is the leader
    if (userMembership.role === GroupRole.LEADER) {
      throw new ForbiddenException(
        'Group leader cannot leave the group. Transfer leadership to another member first.',
      );
    }

    // Remove the user from the group
    await this.prisma.groupMember.delete({
      where: {
        id: userMembership.id,
      },
    });

    // Thông báo qua GroupGateway
    this.groupGateway.notifyMemberRemoved(groupId, {
      groupId,
      userId,
      removedBy: userId, // User removed themselves
      left: true, // Flag to indicate this was a voluntary leave
      timestamp: new Date(),
    });

    // Phát sự kiện để MessageGateway cập nhật room
    this.eventService.emitGroupMemberRemoved(groupId, userId, userId, {
      left: true,
    });

    this.logger.log(`User ${userId} left group ${groupId}`);
  }

  /**
   * Update group avatar
   * @param groupId Group ID
   * @param file Avatar file
   * @param requestUserId User ID making the request
   * @returns Updated group
   */
  async updateGroupAvatar(
    groupId: string,
    file: Express.Multer.File,
    requestUserId: string,
  ): Promise<Group> {
    // Validate access
    await this.validateGroupAccess(
      groupId,
      requestUserId,
      'update group avatar',
    );

    // Get group
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Only image files are allowed for group avatars',
      );
    }

    // Delete old avatar if exists
    if (group.avatarUrl) {
      try {
        const oldPath = new URL(group.avatarUrl).pathname.split('/').pop();
        if (oldPath) {
          await this.storageService.deleteFile(
            oldPath,
            this.GROUP_AVATARS_BUCKET,
          );
        }
      } catch (error) {
        // Log but continue
        this.logger.warn(`Failed to delete old group avatar: ${error.message}`);
      }
    }

    // Upload new avatar
    const [uploadedFile] = await this.storageService.uploadFiles(
      [file],
      this.GROUP_AVATARS_BUCKET,
      groupId,
    );

    // Update group with new avatar URL
    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: { avatarUrl: uploadedFile.url },
    });

    // Notify group members about the avatar update
    this.groupGateway.notifyAvatarUpdated(groupId, {
      groupId,
      avatarUrl: uploadedFile.url,
      updatedBy: requestUserId,
      timestamp: new Date(),
    });

    // Phát sự kiện để cập nhật ảnh đại diện nhóm
    this.eventService.emitGroupAvatarUpdated(
      groupId,
      uploadedFile.url,
      requestUserId,
    );

    return updatedGroup;
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FriendStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';
import { FriendGateway } from './friend.gateway';

@Injectable()
export class FriendService {
  private readonly logger = new Logger('FriendService');

  constructor(
    private prisma: PrismaService,
    private friendGateway: FriendGateway,
  ) {}

  // Gửi lời mời kết bạn
  async sendFriendRequest(senderId: string, dto: SendFriendRequestDto) {
    const { receiverId, introduce } = dto;

    // Validate UUID format
    if (!this.isValidUUID(senderId) || !this.isValidUUID(receiverId)) {
      // log id
      this.logger.log(`Sender ID: ${senderId}, Receiver ID: ${receiverId}`);
      throw new BadRequestException('Invalid user ID format');
    }

    // Kiểm tra người gửi và người nhận có tồn tại không
    const [sender, receiver] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: senderId },
        include: { userInfo: true },
      }),
      this.prisma.user.findUnique({
        where: { id: receiverId },
        include: { userInfo: true },
      }),
    ]);

    if (!sender || !receiver) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Kiểm tra xem người dùng có tự gửi lời mời kết bạn cho chính mình không
    if (senderId === receiverId) {
      throw new BadRequestException(
        'Không thể gửi lời mời kết bạn cho chính mình',
      );
    }

    // Kiểm tra xem đã có mối quan hệ bạn bè nào giữa hai người dùng chưa
    const existingFriendship = await this.prisma.friend.findFirst({
      where: {
        OR: [
          {
            senderId,
            receiverId,
          },
          {
            senderId: receiverId,
            receiverId: senderId,
          },
        ],
      },
    });

    // Nếu đã có mối quan hệ bạn bè
    if (existingFriendship) {
      // Nếu đã là bạn bè
      if (existingFriendship.status === FriendStatus.ACCEPTED) {
        throw new BadRequestException('Hai người dùng đã là bạn bè');
      }

      // Nếu đã bị block
      if (existingFriendship.status === FriendStatus.BLOCKED) {
        throw new ForbiddenException('Không thể gửi lời mời kết bạn');
      }

      // Nếu đã bị từ chối, kiểm tra thời gian
      if (existingFriendship.status === FriendStatus.DECLINED) {
        // Kiểm tra xem người gửi hiện tại có phải là người nhận trước đó không
        if (existingFriendship.receiverId === senderId) {
          // Nếu người gửi hiện tại là người nhận trước đó, đảo ngược vai trò
          // Xóa mối quan hệ cũ
          await this.prisma.friend.delete({
            where: { id: existingFriendship.id },
          });

          // Tạo mới mối quan hệ với vai trò đảo ngược
          const newRequest = await this.prisma.friend.create({
            data: {
              senderId,
              receiverId,
              status: FriendStatus.PENDING,
              introduce: introduce || null,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  email: true,
                  phoneNumber: true,
                  userInfo: {
                    select: {
                      fullName: true,
                      profilePictureUrl: true,
                    },
                  },
                },
              },
              receiver: {
                select: {
                  id: true,
                  email: true,
                  phoneNumber: true,
                  userInfo: {
                    select: {
                      fullName: true,
                      profilePictureUrl: true,
                    },
                  },
                },
              },
            },
          });

          // Emit reload event to both users when creating a new request after role reversal
          this.friendGateway.emitReloadEvent(senderId, receiverId);

          return newRequest;
        } else {
          // Nếu người gửi hiện tại vẫn là người gửi trước đó, chỉ cập nhật trạng thái
          const updatedRequest = await this.prisma.friend.update({
            where: { id: existingFriendship.id },
            data: {
              status: FriendStatus.PENDING,
              updatedAt: new Date(),
              introduce: introduce || null,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  email: true,
                  phoneNumber: true,
                  userInfo: {
                    select: {
                      fullName: true,
                      profilePictureUrl: true,
                    },
                  },
                },
              },
              receiver: {
                select: {
                  id: true,
                  email: true,
                  phoneNumber: true,
                  userInfo: {
                    select: {
                      fullName: true,
                      profilePictureUrl: true,
                    },
                  },
                },
              },
            },
          });

          // Emit reload event to both users when updating from DECLINED to PENDING
          this.friendGateway.emitReloadEvent(senderId, receiverId);

          return updatedRequest;
        }
      }

      // Nếu đang chờ xác nhận
      if (existingFriendship.status === FriendStatus.PENDING) {
        // Nếu người gửi hiện tại là người nhận trước đó, tự động chấp nhận
        if (existingFriendship.receiverId === senderId) {
          return this.prisma.friend.update({
            where: { id: existingFriendship.id },
            data: {
              status: FriendStatus.ACCEPTED,
              updatedAt: new Date(),
            },
            include: {
              sender: {
                select: {
                  id: true,
                  email: true,
                  phoneNumber: true,
                  userInfo: {
                    select: {
                      fullName: true,
                      profilePictureUrl: true,
                    },
                  },
                },
              },
              receiver: {
                select: {
                  id: true,
                  email: true,
                  phoneNumber: true,
                  userInfo: {
                    select: {
                      fullName: true,
                      profilePictureUrl: true,
                    },
                  },
                },
              },
            },
          });
        } else {
          throw new BadRequestException(
            'Lời mời kết bạn đã được gửi và đang chờ xác nhận',
          );
        }
      }
    }

    // Tạo mới lời mời kết bạn
    const newFriendRequest = await this.prisma.friend.create({
      data: {
        senderId,
        receiverId,
        status: FriendStatus.PENDING,
        introduce: introduce || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            userInfo: {
              select: {
                fullName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            userInfo: {
              select: {
                fullName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
    });

    // Emit reload event to both users
    this.friendGateway.emitReloadEvent(senderId, receiverId);

    return newFriendRequest;
  }

  // Phản hồi lời mời kết bạn (chấp nhận, từ chối, block)
  async respondToFriendRequest(userId: string, dto: RespondFriendRequestDto) {
    const { requestId, status } = dto;

    // Validate UUID format
    if (!this.isValidUUID(userId) || !this.isValidUUID(requestId)) {
      throw new BadRequestException('Invalid ID format');
    }

    // Kiểm tra lời mời kết bạn có tồn tại không
    const friendRequest = await this.prisma.friend.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      throw new NotFoundException('Lời mời kết bạn không tồn tại');
    }

    // Kiểm tra xem người dùng có phải là người nhận lời mời không
    if (friendRequest.receiverId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền phản hồi lời mời kết bạn này',
      );
    }

    // Kiểm tra trạng thái hiện tại của lời mời
    if (friendRequest.status !== FriendStatus.PENDING) {
      throw new BadRequestException('Lời mời kết bạn này đã được phản hồi');
    }

    // Cập nhật trạng thái lời mời
    const updatedFriendRequest = await this.prisma.friend.update({
      where: { id: requestId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            userInfo: {
              select: {
                fullName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            userInfo: {
              select: {
                fullName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
    });
    // Emit reload event to both users
    this.friendGateway.emitReloadEvent(friendRequest.senderId, userId);

    return updatedFriendRequest;
  }

  // Block người dùng
  async blockUser(userId: string, targetId: string) {
    // Validate UUID format to prevent errors
    if (!this.isValidUUID(userId) || !this.isValidUUID(targetId)) {
      this.logger.log(`Sender ID: ${userId}, Target ID: ${targetId}`);
      throw new BadRequestException('Invalid user ID format');
    }

    // Kiểm tra người dùng có tồn tại không
    const [user, target] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.user.findUnique({ where: { id: targetId } }),
    ]);

    if (!user || !target) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Kiểm tra xem người dùng có tự block chính mình không
    if (userId === targetId) {
      throw new BadRequestException('Không thể block chính mình');
    }

    // Kiểm tra xem đã có mối quan hệ bạn bè nào giữa hai người dùng chưa
    const existingFriendship = await this.prisma.friend.findFirst({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: targetId,
          },
          {
            senderId: targetId,
            receiverId: userId,
          },
        ],
      },
    });

    let blockedRelationship: any;

    if (existingFriendship) {
      // Nếu người dùng hiện tại là người gửi
      if (existingFriendship.senderId === userId) {
        blockedRelationship = await this.prisma.friend.update({
          where: { id: existingFriendship.id },
          data: {
            status: FriendStatus.BLOCKED,
            updatedAt: new Date(),
          },
        });
      } else {
        // Nếu người dùng hiện tại là người nhận, đảo ngược mối quan hệ
        await this.prisma.friend.delete({
          where: { id: existingFriendship.id },
        });

        // Tạo mới mối quan hệ block
        blockedRelationship = await this.prisma.friend.create({
          data: {
            senderId: userId,
            receiverId: targetId,
            status: FriendStatus.BLOCKED,
          },
        });
      }
    } else {
      // Tạo mới mối quan hệ block
      blockedRelationship = await this.prisma.friend.create({
        data: {
          senderId: userId,
          receiverId: targetId,
          status: FriendStatus.BLOCKED,
        },
      });
    }

    // Emit reload event to both users
    this.friendGateway.emitReloadEvent(userId, targetId);

    return blockedRelationship;
  }

  // Lấy danh sách lời mời kết bạn đã nhận
  async getReceivedFriendRequests(userId: string) {
    // Validate UUID format
    if (!this.isValidUUID(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    return this.prisma.friend.findMany({
      where: {
        receiverId: userId,
        status: FriendStatus.PENDING,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            userInfo: {
              select: {
                fullName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Lấy danh sách lời mời kết bạn đã gửi
  async getSentFriendRequests(userId: string) {
    // Validate UUID format
    if (!this.isValidUUID(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    return this.prisma.friend.findMany({
      where: {
        senderId: userId,
        status: FriendStatus.PENDING,
      },
      include: {
        receiver: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            userInfo: {
              select: {
                fullName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Lấy danh sách bạn bè
  async getFriendList(userId: string) {
    // Validate UUID format
    if (!this.isValidUUID(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const friends = await this.prisma.friend.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            status: FriendStatus.ACCEPTED,
          },
          {
            receiverId: userId,
            status: FriendStatus.ACCEPTED,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            userInfo: {
              select: {
                fullName: true,
                profilePictureUrl: true,
                statusMessage: true,
                lastSeen: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            userInfo: {
              select: {
                fullName: true,
                profilePictureUrl: true,
                statusMessage: true,
                lastSeen: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Chuyển đổi kết quả để trả về thông tin bạn bè (không phải người dùng hiện tại)
    return friends.map((friend) => {
      const isSender = friend.senderId === userId;
      const friendUser = isSender ? friend.receiver : friend.sender;

      return {
        friendshipId: friend.id,
        friend: friendUser,
        since: friend.updatedAt,
      };
    });
  }

  // Lấy danh sách người dùng đã block
  async getBlockedUsers(userId: string) {
    // Validate UUID format
    if (!this.isValidUUID(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    return this.prisma.friend.findMany({
      where: {
        senderId: userId,
        status: FriendStatus.BLOCKED,
      },
      include: {
        receiver: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            userInfo: {
              select: {
                fullName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  // Helper method to validate UUID format
  private isValidUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  // Hủy block người dùng
  async unblockUser(userId: string, targetId: string) {
    // Validate UUID format
    if (!this.isValidUUID(userId) || !this.isValidUUID(targetId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const blockedRelation = await this.prisma.friend.findFirst({
      where: {
        senderId: userId,
        receiverId: targetId,
        status: FriendStatus.BLOCKED,
      },
    });

    if (!blockedRelation) {
      throw new NotFoundException('Không tìm thấy mối quan hệ block');
    }

    // Delete the blocked relationship
    const result = await this.prisma.friend.delete({
      where: { id: blockedRelation.id },
    });

    // Emit reload event to both users
    this.friendGateway.emitReloadEvent(userId, targetId);

    return result;
  }

  // Hủy kết bạn
  async unfriend(userId: string, friendId: string) {
    // Validate UUID format
    if (!this.isValidUUID(userId) || !this.isValidUUID(friendId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const friendship = await this.prisma.friend.findFirst({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: friendId,
            status: FriendStatus.ACCEPTED,
          },
          {
            senderId: friendId,
            receiverId: userId,
            status: FriendStatus.ACCEPTED,
          },
        ],
      },
    });

    if (!friendship) {
      throw new NotFoundException('Không tìm thấy mối quan hệ bạn bè');
    }

    // Delete the friendship
    const result = await this.prisma.friend.delete({
      where: { id: friendship.id },
    });

    // Emit reload event to both users
    this.friendGateway.emitReloadEvent(userId, friendId);

    return result;
  }

  // Hủy lời mời kết bạn đã gửi
  async cancelFriendRequest(userId: string, requestId: string) {
    // Validate UUID format
    if (!this.isValidUUID(userId) || !this.isValidUUID(requestId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const friendRequest = await this.prisma.friend.findFirst({
      where: {
        id: requestId,
        senderId: userId,
        status: FriendStatus.PENDING,
      },
    });

    if (!friendRequest) {
      throw new NotFoundException('Không tìm thấy lời mời kết bạn');
    }

    const receiverId = friendRequest.receiverId;

    // Delete the friend request
    const result = await this.prisma.friend.delete({
      where: { id: requestId },
    });

    // Emit reload event to both users
    this.friendGateway.emitReloadEvent(userId, receiverId);

    return result;
  }

  // Lấy mối quan hệ giữa hai người dùng
  async getRelationship(userId: string, targetId: string) {
    // Validate UUID format
    if (!this.isValidUUID(userId) || !this.isValidUUID(targetId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    // Kiểm tra người dùng có tồn tại không
    const [user, target] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.user.findUnique({ where: { id: targetId } }),
    ]);

    if (!user || !target) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Kiểm tra xem người dùng có tự kiểm tra mối quan hệ với chính mình không
    if (userId === targetId) {
      return {
        status: 'SELF',
        message: 'Đây là chính bạn',
        relationship: null,
      };
    }

    // Tìm kiếm mối quan hệ giữa hai người dùng
    const relationship = await this.prisma.friend.findFirst({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: targetId,
          },
          {
            senderId: targetId,
            receiverId: userId,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            userInfo: {
              select: {
                fullName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            userInfo: {
              select: {
                fullName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
    });

    // Nếu không có mối quan hệ
    if (!relationship) {
      // Get user info for the target user
      const targetUserInfo = await this.prisma.userInfo.findUnique({
        where: { id: targetId },
      });

      return {
        status: 'NONE',
        message: 'Không có mối quan hệ',
        relationship: null,
        targetUser: {
          id: targetId,
          email: target.email,
          phoneNumber: target.phoneNumber,
          userInfo: {
            fullName: targetUserInfo?.fullName,
            profilePictureUrl: targetUserInfo?.profilePictureUrl,
            coverImgUrl: targetUserInfo?.coverImgUrl,
            bio: targetUserInfo?.bio,
            statusMessage: targetUserInfo?.statusMessage,
          },
        },
      };
    }

    // Xác định loại mối quan hệ dựa trên trạng thái và vai trò
    let status = '';
    let message = '';

    switch (relationship.status) {
      case FriendStatus.ACCEPTED:
        status = 'FRIEND';
        message = 'Đã là bạn bè';
        break;
      case FriendStatus.PENDING:
        if (relationship.senderId === userId) {
          status = 'PENDING_SENT';
          message = 'Đã gửi lời mời kết bạn';
        } else {
          status = 'PENDING_RECEIVED';
          message = 'Đã nhận lời mời kết bạn';
        }
        break;
      case FriendStatus.DECLINED:
        if (relationship.senderId === userId) {
          status = 'NONE';
          message = 'Lời mời kết bạn đã bị từ chối';
        } else {
          status = 'DECLINED_RECEIVED';
          message = 'Bạn đã từ chối lời mời kết bạn';
        }
        break;
      case FriendStatus.BLOCKED:
        if (relationship.senderId === userId) {
          status = 'BLOCKED';
          message = 'Bạn đã chặn người dùng này';
        } else {
          status = 'BLOCKED_BY';
          message = 'Bạn đã bị người dùng này chặn';
        }
        break;
    }
    return {
      status,
      message,
      relationship,
      targetUser:
        relationship.senderId === userId
          ? relationship.receiver
          : relationship.sender,
    };
  }
}

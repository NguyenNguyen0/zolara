import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendStatus } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  async getUserById(id: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        userInfo: {
          select: {
            fullName: true,
            dateOfBirth: true,
            gender: true,
            bio: true,
            profilePictureUrl: true,
            statusMessage: true,
            lastSeen: true,
            coverImgUrl: true,
          },
        },
      },
    });

    if (!user) return null;

    // If no currentUserId is provided or the user is viewing their own profile, return full data
    if (!currentUserId || currentUserId === id) {
      return {
        ...user,
        relationship:
          currentUserId === id
            ? {
                status: 'SELF',
                message: 'Đây là chính bạn',
                friendshipId: null,
              }
            : null,
      };
    }

    // Check friendship status
    const relationship = await this.prisma.friend.findFirst({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: id,
          },
          {
            senderId: id,
            receiverId: currentUserId,
          },
        ],
      },
    });

    // Prepare the response
    const response = {
      id: user.id,
      // Only include sensitive information if they are friends
      email: null,
      phoneNumber: null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      userInfo: {
        fullName: user.userInfo?.fullName,
        bio: user.userInfo?.bio,
        profilePictureUrl: user.userInfo?.profilePictureUrl,
        statusMessage: user.userInfo?.statusMessage,
        coverImgUrl: user.userInfo?.coverImgUrl,
        // Restrict sensitive userInfo fields
        dateOfBirth: null,
        gender: null,
        lastSeen: null,
      },
      relationship: null,
    };

    // If there's a relationship and it's ACCEPTED, include the sensitive information
    if (relationship && relationship.status === FriendStatus.ACCEPTED) {
      response.email = user.email;
      response.phoneNumber = user.phoneNumber;
      if (user.userInfo) {
        response.userInfo.dateOfBirth = user.userInfo.dateOfBirth;
        response.userInfo.gender = user.userInfo.gender;
        response.userInfo.lastSeen = user.userInfo.lastSeen;
      }
    }

    // Add relationship information
    if (relationship) {
      // Determine relationship type based on status and roles
      let status = '';
      let message = '';

      switch (relationship.status) {
        case FriendStatus.PENDING:
          if (relationship.senderId === currentUserId) {
            status = 'PENDING_SENT';
            message = 'Đã gửi lời mời kết bạn';
          } else {
            status = 'PENDING_RECEIVED';
            message = 'Đã nhận lời mời kết bạn';
          }
          break;
        case FriendStatus.ACCEPTED:
          status = 'FRIEND';
          message = 'Đã là bạn bè';
          break;
        case FriendStatus.DECLINED:
          if (relationship.senderId === currentUserId) {
            status = 'NONE';
            message = 'Lời mời kết bạn đã bị từ chối';
          } else {
            status = 'DECLINED_RECEIVED';
            message = 'Bạn đã từ chối lời mời kết bạn';
          }
          break;
        case FriendStatus.BLOCKED:
          if (relationship.senderId === currentUserId) {
            status = 'BLOCKED';
            message = 'Bạn đã chặn người dùng này';
          } else {
            status = 'BLOCKED_BY';
            message = 'Bạn đã bị người dùng này chặn';
          }
          break;
      }

      response.relationship = {
        status,
        message,
        friendshipId: relationship.id,
      };
    } else {
      // No relationship exists
      response.relationship = {
        status: 'NONE',
        message: 'Không có mối quan hệ',
        friendshipId: null,
      };
    }

    return response;
  }

  async getUserBasicInfo(id: string) {
    return this.prisma.userInfo.findUnique({
      where: { id },
      select: {
        fullName: true,
        dateOfBirth: true,
        gender: true,
        bio: true,
        profilePictureUrl: true,
        statusMessage: true,
        coverImgUrl: true,
      },
    });
  }

  async searchUserByEmailOrPhone(
    email?: string,
    phoneNumber?: string,
    currentUserId?: string,
  ) {
    // Kiểm tra xem có ít nhất một trong hai tham số được cung cấp
    if (!email && !phoneNumber) {
      throw new NotFoundException(
        'Vui lòng cung cấp email hoặc số điện thoại để tìm kiếm',
      );
    }

    // Tìm kiếm người dùng theo email hoặc số điện thoại
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phoneNumber: phoneNumber || undefined },
        ],
      },
      include: {
        userInfo: true,
      },
    });

    // Nếu không tìm thấy người dùng hoặc người dùng đã chặn tìm kiếm từ người lạ
    if (!user || user.userInfo?.blockStrangers) {
      // Tạo thông báo lỗi dựa trên loại tìm kiếm (email hoặc số điện thoại)
      if (email) {
        throw new NotFoundException(
          'Email chưa đăng ký tài khoản hoặc không cho phép tìm kiếm',
        );
      } else {
        throw new NotFoundException(
          'Số điện thoại chưa đăng ký tài khoản hoặc không cho phép tìm kiếm',
        );
      }
    }

    // Prepare the response with user information
    const response = {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userInfo: {
        fullName: user.userInfo?.fullName,
        profilePictureUrl: user.userInfo?.profilePictureUrl,
        coverImgUrl: user.userInfo?.coverImgUrl,
        bio: user.userInfo?.bio,
      },
      relationship: null,
    };

    // If currentUserId is provided, check the relationship
    if (currentUserId && currentUserId !== user.id) {
      // Check if there's a relationship between the current user and the found user
      const relationship = await this.prisma.friend.findFirst({
        where: {
          OR: [
            {
              senderId: currentUserId,
              receiverId: user.id,
            },
            {
              senderId: user.id,
              receiverId: currentUserId,
            },
          ],
        },
      });

      if (relationship) {
        // Determine relationship type based on status and roles
        let status = '';
        let message = '';

        switch (relationship.status) {
          case FriendStatus.ACCEPTED:
            status = 'FRIEND';
            message = 'Đã là bạn bè';
            break;
          case FriendStatus.PENDING:
            if (relationship.senderId === currentUserId) {
              status = 'PENDING_SENT';
              message = 'Đã gửi lời mời kết bạn';
            } else {
              status = 'PENDING_RECEIVED';
              message = 'Đã nhận lời mời kết bạn';
            }
            break;
          case FriendStatus.DECLINED:
            if (relationship.senderId === currentUserId) {
              status = 'NONE';
              message = 'Lời mời kết bạn đã bị từ chối';
            } else {
              status = 'DECLINED_RECEIVED';
              message = 'Bạn đã từ chối lời mời kết bạn';
            }
            break;
          case FriendStatus.BLOCKED:
            if (relationship.senderId === currentUserId) {
              status = 'BLOCKED';
              message = 'Bạn đã chặn người dùng này';
            } else {
              status = 'BLOCKED_BY';
              message = 'Bạn đã bị người dùng này chặn';
            }
            break;
        }

        response.relationship = {
          status,
          message,
          friendshipId: relationship.id,
        };
      } else {
        // No relationship exists
        response.relationship = {
          status: 'NONE',
          message: 'Không có mối quan hệ',
          friendshipId: null,
        };
      }
    } else if (currentUserId && currentUserId === user.id) {
      // If the user is searching for themselves
      response.relationship = {
        status: 'SELF',
        message: 'Đây là chính bạn',
        friendshipId: null,
      };
    }

    return response;
  }
}

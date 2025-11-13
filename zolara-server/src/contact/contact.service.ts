import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContactItemDto } from './dto/sync-contacts.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Đồng bộ danh bạ từ điện thoại của người dùng
   * @param userId ID của người dùng đang đồng bộ danh bạ
   * @param contactItems Danh sách các contact từ điện thoại
   */
  async syncContacts(userId: string, contactItems: ContactItemDto[]) {
    this.logger.log(
      `Đồng bộ ${contactItems.length} contacts cho user ${userId}`,
    );

    // 1. Lấy danh sách các contact hiện tại của user
    const existingContacts = await this.prisma.contact.findMany({
      where: {
        userId: userId,
      },
      include: {
        contactUser: {
          select: {
            phoneNumber: true,
          },
        },
      },
    });

    // 2. Tạo map từ số điện thoại đến contact hiện tại để dễ tìm kiếm
    const existingContactMap = new Map(
      existingContacts.map((contact) => [
        contact.contactUser.phoneNumber,
        contact,
      ]),
    );

    // 3. Tạo map từ số điện thoại đến tên contact từ danh bạ mới
    const newContactMap = new Map(
      contactItems.map((item) => [item.phone, item.name]),
    );

    // 4. Tìm các số điện thoại đã có tài khoản trong hệ thống
    const phoneNumbers = contactItems.map((item) => item.phone);
    const usersWithPhoneNumbers = await this.prisma.user.findMany({
      where: {
        phoneNumber: {
          in: phoneNumbers,
        },
      },
      select: {
        id: true,
        phoneNumber: true,
      },
    });

    // 5. Tạo map từ số điện thoại đến user ID
    const phoneToUserIdMap = new Map(
      usersWithPhoneNumbers.map((user) => [user.phoneNumber, user.id]),
    );

    // 6. Tạo danh sách các contact cần tạo mới
    const contactsToCreate = [];
    for (const item of contactItems) {
      const contactUserId = phoneToUserIdMap.get(item.phone);

      // Chỉ tạo contact nếu số điện thoại đã có tài khoản và chưa có trong danh bạ
      if (contactUserId && !existingContactMap.has(item.phone)) {
        contactsToCreate.push({
          userId: userId,
          contactUserId: contactUserId,
          nickname: item.name,
        });
      }
    }

    // 7. Tìm các contact cần xóa (không còn trong danh bạ mới)
    const contactsToDelete = existingContacts.filter(
      (contact) => !newContactMap.has(contact.contactUser.phoneNumber),
    );

    // 8. Thực hiện các thao tác tạo và xóa trong transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Tạo các contact mới
      if (contactsToCreate.length > 0) {
        await tx.contact.createMany({
          data: contactsToCreate,
        });
      }

      // Xóa các contact không còn trong danh bạ
      if (contactsToDelete.length > 0) {
        await tx.contact.deleteMany({
          where: {
            id: {
              in: contactsToDelete.map((contact) => contact.id),
            },
          },
        });
      }

      // Trả về số lượng contact đã tạo và xóa
      return {
        created: contactsToCreate.length,
        deleted: contactsToDelete.length,
      };
    });

    return {
      message: 'Đồng bộ danh bạ thành công',
      ...result,
    };
  }

  /**
   * Lấy danh sách contact của người dùng
   * @param userId ID của người dùng
   */
  async getUserContacts(userId: string) {
    const contacts = await this.prisma.contact.findMany({
      where: {
        userId: userId,
      },
      include: {
        contactUser: {
          select: {
            id: true,
            phoneNumber: true,
            userInfo: {
              select: {
                fullName: true,
                profilePictureUrl: true,
                coverImgUrl: true,
                statusMessage: true,
                lastSeen: true,
              },
            },
          },
        },
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    // Lấy thông tin mối quan hệ cho từng contact
    const contactsWithRelationship = await Promise.all(
      contacts.map(async (contact) => {
        const relationship = await this.prisma.friend.findFirst({
          where: {
            OR: [
              {
                senderId: userId,
                receiverId: contact.contactUserId,
              },
              {
                senderId: contact.contactUserId,
                receiverId: userId,
              },
            ],
          },
        });

        let relationshipStatus = {
          status: 'NONE',
          message: 'Không có mối quan hệ',
          friendshipId: null,
        };

        if (relationship) {
          switch (relationship.status) {
            case 'ACCEPTED':
              relationshipStatus = {
                status: 'FRIEND',
                message: 'Đã là bạn bè',
                friendshipId: relationship.id,
              };
              break;
            case 'PENDING':
              if (relationship.senderId === userId) {
                relationshipStatus = {
                  status: 'PENDING_SENT',
                  message: 'Đã gửi lời mời kết bạn',
                  friendshipId: relationship.id,
                };
              } else {
                relationshipStatus = {
                  status: 'PENDING_RECEIVED',
                  message: 'Đã nhận lời mời kết bạn',
                  friendshipId: relationship.id,
                };
              }
              break;
            case 'BLOCKED':
              if (relationship.senderId === userId) {
                relationshipStatus = {
                  status: 'BLOCKED',
                  message: 'Bạn đã chặn người dùng này',
                  friendshipId: relationship.id,
                };
              } else {
                relationshipStatus = {
                  status: 'BLOCKED_BY',
                  message: 'Bạn đã bị người dùng này chặn',
                  friendshipId: relationship.id,
                };
              }
              break;
          }
        }

        return {
          ...contact,
          relationship: relationshipStatus,
        };
      }),
    );

    return contactsWithRelationship;
  }
}

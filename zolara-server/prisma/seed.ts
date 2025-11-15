import { PrismaClient, Gender, FriendStatus, DeviceType } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function deleteAllData() {
  await prisma.refreshToken.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.postReaction.deleteMany({});
  await prisma.hiddenPost.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.story.deleteMany({});
  await prisma.cloudStorage.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.friend.deleteMany({});
  await prisma.groupMember.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.qrCode.deleteMany({});
  await prisma.pinnedItem.deleteMany({});
  await prisma.userInfo.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Data deleted successfully!');
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function main() {
  const users = await createUsers();
  await createFriendships(users);
}

async function createUsers() {
  await prisma.refreshToken.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.postReaction.deleteMany({});
  await prisma.hiddenPost.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.story.deleteMany({});
  await prisma.cloudStorage.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.friend.deleteMany({});
  await prisma.groupMember.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.qrCode.deleteMany({});
  await prisma.pinnedItem.deleteMany({});
  await prisma.userInfo.deleteMany({});
  await prisma.user.deleteMany({});

  const userData = [
    {
      id: 'a1a0ae5b-070f-40c2-a07d-c61c06623e7a',
      email: 'nvminh162@gmail.com',
      phoneNumber: '0353999798',
      fullName: 'Nguyễn Văn Minh',
      dateOfBirth: new Date('2004-02-16'),
      gender: Gender.MALE,
      bio: 'Lập trình dien^',
      profilePictureUrl:
        'https://res.klook.com/image/upload/v1739342911/rx3ewozeuzvziq5cpgav.jpg',
      statusMessage: 'Live, Love, Travel, Gym 🌍✈️',
      coverImgUrl:
        'https://cover-talk.zadn.vn/d/7/5/d/6/8b20eca05f9660b6d4e1596ac2dc009c.jpg',
      password: 'password123',
    },
    {
      id: 'cea3f6a0-b3bf-4abe-9266-7a3a6fc29173',
      email: 'phuong.tran@example.com',
      phoneNumber: '0912345678',
      fullName: 'Trần Thị Phương',
      dateOfBirth: new Date('2002-07-20'),
      gender: Gender.FEMALE,
      bio: 'Yêu thích âm nhạc và nghệ thuật. Thích vẽ tranh và chơi guitar vào thời gian rảnh.',
      profilePictureUrl:
        'https://res.klook.com/image/upload/v1739342911/rx3ewozeuzvziq5cpgav.jpg',
      statusMessage: 'Music is life 🎵🎨',
      coverImgUrl:
        'https://cover-talk.zadn.vn/d/7/5/d/6/8b20eca05f9660b6d4e1596ac2dc009c.jpg',
      password: 'password123',
    },
    {
      id: '43c307df-1cf7-407f-85e4-21f16a4e3bf9',
      email: 'quan.le@example.com',
      phoneNumber: '0923456789',
      fullName: 'Lê Minh Quân',
      dateOfBirth: new Date('2000-09-12'),
      gender: Gender.MALE,
      bio: 'Đam mê thể thao và sống khỏe. Thích chạy bộ buổi sáng và tập gym. Luôn tìm kiếm động lực để phát triển bản thân mỗi ngày.',
      profilePictureUrl:
        'https://res.klook.com/image/upload/v1739342911/rx3ewozeuzvziq5cpgav.jpg',
      statusMessage: 'No pain, no gain 💪🏃',
      coverImgUrl:
        'https://cover-talk.zadn.vn/d/7/5/d/6/8b20eca05f9660b6d4e1596ac2dc009c.jpg',
      password: 'password123',
    },
    {
      id: '1cc1b368-02e1-44a7-87c1-17ab9620bb5f',
      email: 'huong.pham@example.com',
      phoneNumber: '0934567890',
      fullName: 'Phạm Thu Hương',
      dateOfBirth: new Date('2001-12-25'),
      gender: Gender.FEMALE,
      bio: 'Yêu thích đọc sách và viết lách. Thích thơ ca và những câu chuyện cảm động. Mơ ước trở thành nhà văn trong tương lai.',
      profilePictureUrl:
        'https://res.klook.com/image/upload/v1739342911/rx3ewozeuzvziq5cpgav.jpg',
      statusMessage: 'Words paint pictures 📚✍️',
      coverImgUrl:
        'https://cover-talk.zadn.vn/d/7/5/d/6/8b20eca05f9660b6d4e1596ac2dc009c.jpg',
      password: 'password123',
    },
    {
      id: '300bc485-d342-442e-aa08-95b754ba901d',
      email: 'dat.nguyen@example.com',
      phoneNumber: '0945678901',
      fullName: 'Nguyễn Tiến Đạt',
      dateOfBirth: new Date('1999-03-08'),
      gender: Gender.MALE,
      bio: 'Đam mê công nghệ và khởi nghiệp. Luôn tìm kiếm cơ hội mới và thử thách bản thân. Yêu thích startup culture.',
      profilePictureUrl:
        'https://res.klook.com/image/upload/v1739342911/rx3ewozeuzvziq5cpgav.jpg',
      statusMessage: 'Think different, build different 🚀',
      coverImgUrl:
        'https://cover-talk.zadn.vn/d/7/5/d/6/8b20eca05f9660b6d4e1596ac2dc009c.jpg',
      password: 'password123',
    },
    {
      id: '3d09a459-8398-4ec8-ba0f-ffb881f77632',
      email: 'linh.vo@example.com',
      phoneNumber: '0956789012',
      fullName: 'Võ Thị Linh',
      dateOfBirth: new Date('2002-11-14'),
      gender: Gender.FEMALE,
      bio: 'Yêu thích nấu ăn và làm bánh. Thích chia sẻ công thức món ngon với mọi người. Mơ ước mở tiệm bánh riêng.',
      profilePictureUrl:
        'https://res.klook.com/image/upload/v1739342911/rx3ewozeuzvziq5cpgav.jpg',
      statusMessage: 'Baking happiness 🧁🍰',
      coverImgUrl:
        'https://cover-talk.zadn.vn/d/7/5/d/6/8b20eca05f9660b6d4e1596ac2dc009c.jpg',
      password: 'password123',
    },
    {
      id: '422a4298-58d6-41d9-a28e-4025c19baf3a',
      email: 'tuan.hoang@example.com',
      phoneNumber: '0967890123',
      fullName: 'Hoàng Anh Tuấn',
      dateOfBirth: new Date('2000-06-30'),
      gender: Gender.MALE,
      bio: 'Đam mê game và esports. Thích chơi MOBA và FPS. Luôn theo dõi các giải đấu quốc tế và học hỏi từ pro players.',
      profilePictureUrl:
        'https://res.klook.com/image/upload/v1739342911/rx3ewozeuzvziq5cpgav.jpg',
      statusMessage: 'GG EZ 🎮🏆',
      coverImgUrl:
        'https://cover-talk.zadn.vn/d/7/5/d/6/8b20eca05f9660b6d4e1596ac2dc009c.jpg',
      password: 'password123',
    },
    {
      id: '84cc97a1-be78-4ae9-975b-efe8328fe015',
      email: 'mai.dang@example.com',
      phoneNumber: '0978901234',
      fullName: 'Đặng Thị Mai',
      dateOfBirth: new Date('2001-04-18'),
      gender: Gender.FEMALE,
      bio: 'Yêu thích thời trang và làm đẹp. Thích khám phá xu hướng mới và chia sẻ tips làm đẹp. Luôn tự tin với phong cách riêng.',
      profilePictureUrl:
        'https://res.klook.com/image/upload/v1739342911/rx3ewozeuzvziq5cpgav.jpg',
      statusMessage: 'Style is eternal 👗💄',
      coverImgUrl:
        'https://cover-talk.zadn.vn/d/7/5/d/6/8b20eca05f9660b6d4e1596ac2dc009c.jpg',
      password: 'password123',
    },
    {
      id: 'ac3fe11d-01bf-4ef0-9992-661e621253c2',
      email: 'khoa.bui@example.com',
      phoneNumber: '0989012345',
      fullName: 'Bùi Đình Khoa',
      dateOfBirth: new Date('1999-08-22'),
      gender: Gender.MALE,
      bio: 'Đam mê nhiếp ảnh và quay phim. Thích ghi lại những khoảnh khắc đẹp trong cuộc sống. Mơ ước trở thành filmmaker chuyên nghiệp.',
      profilePictureUrl:
        'https://res.klook.com/image/upload/v1739342911/rx3ewozeuzvziq5cpgav.jpg',
      statusMessage: 'Frame the moment 📸🎬',
      coverImgUrl:
        'https://cover-talk.zadn.vn/d/7/5/d/6/8b20eca05f9660b6d4e1596ac2dc009c.jpg',
      password: 'password123',
    },
    {
      id: 'b5c8d7e6-f5e4-4d3c-b2a1-0f9e8d7c6b5a',
      email: 'thao.nguyen@example.com',
      phoneNumber: '0990123456',
      fullName: 'Nguyễn Bích Thảo',
      dateOfBirth: new Date('2000-02-28'),
      gender: Gender.FEMALE,
      bio: 'Yêu thiên nhiên và bảo vệ môi trường. Thích trồng cây và làm vườn. Luôn sống xanh và thân thiện với môi trường.',
      profilePictureUrl: null,
      statusMessage: 'Green living 🌱🌍',
      coverImgUrl: null,
      password: 'password123',
    },
    {
      id: 'c6d7e8f9-a0b1-2c3d-4e5f-6a7b8c9d0e1f',
      email: 'son.pham@example.com',
      phoneNumber: '0901234560',
      fullName: 'Phạm Hải Sơn',
      dateOfBirth: new Date('1998-10-05'),
      gender: Gender.MALE,
      bio: 'Yêu thích lập trình và AI. Đam mê nghiên cứu machine learning và deep learning. Luôn cập nhật công nghệ mới nhất.',
      profilePictureUrl: null,
      statusMessage: 'AI will change the world 🤖💡',
      coverImgUrl: null,
      password: 'password123',
    },
    {
      id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a',
      email: 'hong.le@example.com',
      phoneNumber: '0912345601',
      fullName: 'Lê Thị Hồng',
      dateOfBirth: new Date('2001-07-16'),
      gender: Gender.FEMALE,
      bio: 'Yêu thích yoga và meditation. Sống lành mạnh và cân bằng. Thích chia sẻ về lối sống tích cực và mindfulness.',
      profilePictureUrl: null,
      statusMessage: 'Namaste 🧘‍♀️✨',
      coverImgUrl: null,
      password: 'password123',
    },
    {
      id: 'e8f9a0b1-c2d3-4e5f-6a7b-8c9d0e1f2a3b',
      email: 'dung.tran@example.com',
      phoneNumber: '0923456702',
      fullName: 'Trần Quốc Dũng',
      dateOfBirth: new Date('1999-01-20'),
      gender: Gender.MALE,
      bio: 'Đam mê kinh doanh và marketing. Thích nghiên cứu hành vi người tiêu dùng. Luôn tìm kiếm cơ hội để phát triển thương hiệu.',
      profilePictureUrl: null,
      statusMessage: 'Think big, start small 💼📈',
      coverImgUrl: null,
      password: 'password123',
    },
    {
      id: 'f9a0b1c2-d3e4-5f6a-7b8c-9d0e1f2a3b4c',
      email: 'anh.vo@example.com',
      phoneNumber: '0934567803',
      fullName: 'Võ Minh Anh',
      dateOfBirth: new Date('2000-12-10'),
      gender: Gender.FEMALE,
      bio: 'Yêu thích động vật và thiên nhiên hoang dã. Thích chụp ảnh thiên nhiên và bảo vệ động vật. Mơ ước trở thành nhà sinh vật học.',
      profilePictureUrl: null,
      statusMessage: 'Love all creatures 🐾🦋',
      coverImgUrl: null,
      password: 'password123',
    },
  ];

  const createdUsers = [];

  for (const user of userData) {
    // First create the user with fixed ID
    const createdUser = await prisma.user.create({
      data: {
        id: user.id, // Use the fixed ID
        email: user.email,
        phoneNumber: user.phoneNumber,
        passwordHash: await hash(user.password, 10),
        refreshTokens: {
          create: {
            token: `token-${user.email.split('@')[0]}`,
            expiresAt: addDays(new Date(), 30),
            deviceType: DeviceType.DESKTOP,
            ipAddress: '127.0.0.1',
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        },
      },
    });

    // Then create the UserInfo with the same ID
    await prisma.userInfo.create({
      data: {
        id: user.id, // Use the same ID for UserInfo
        fullName: user.fullName,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        bio: user.bio,
        profilePictureUrl: user.profilePictureUrl,
        statusMessage: user.statusMessage,
        coverImgUrl: user.coverImgUrl,
        lastSeen: new Date(),
      },
    });

    createdUsers.push(createdUser);
  }

  return createdUsers;
}

async function createFriendships(users: any[]) {
  const friendships = [
    {
      senderId: users[0].id,
      receiverId: users[1].id,
      status: FriendStatus.ACCEPTED,
      introduce:
        'Tôi biết bạn thông qua số điện thoại, hãy kết bạn với tôi nhé!.',
    },
    {
      senderId: users[0].id,
      receiverId: users[2].id,
      status: FriendStatus.PENDING,
      introduce:
        'Tôi biết bạn thông qua số điện thoại, hãy kết bạn với tôi nhé!.',
    },
    {
      senderId: users[1].id,
      receiverId: users[3].id,
      status: FriendStatus.ACCEPTED,
      introduce:
        'Tôi biết bạn thông qua số điện thoại, hãy kết bạn với tôi nhé!.',
    },
    {
      senderId: users[2].id,
      receiverId: users[3].id,
      status: FriendStatus.ACCEPTED,
      introduce:
        'Tôi biết bạn thông qua số điện thoại, hãy kết bạn với tôi nhé!.',
    },
    {
      senderId: users[3].id,
      receiverId: users[0].id,
      status: FriendStatus.PENDING,
      introduce:
        'Tôi biết bạn thông qua số điện thoại, hãy kết bạn với tôi nhé!.',
    },
    {
      senderId: users[1].id,
      receiverId: users[2].id,
      status: FriendStatus.ACCEPTED,
      introduce:
        'Tôi biết bạn thông qua số điện thoại, hãy kết bạn với tôi nhé!.',
    },
    {
      senderId: users[4].id, // Nguyễn Văn A
      receiverId: users[0].id,
      status: FriendStatus.ACCEPTED,
      introduce: 'Kết bạn nhé!',
    },
    {
      senderId: users[4].id,
      receiverId: users[1].id,
      status: FriendStatus.PENDING,
      introduce: 'Mình là bạn của Văn Minh',
    },
    {
      senderId: users[5].id,
      receiverId: users[2].id,
      status: FriendStatus.ACCEPTED,
      introduce: 'Mình là bạn cùng lớp với Văn Minh',
    },
    {
      senderId: users[3].id,
      receiverId: users[5].id,
      status: FriendStatus.BLOCKED,
      introduce: 'Kết bạn nhé!',
    },
    {
      senderId: users[6].id,
      receiverId: users[0].id,
      status: FriendStatus.ACCEPTED,
      introduce: 'Mình là bạn cùng Văn Minh',
    },
    {
      senderId: users[6].id,
      receiverId: users[4].id,
      status: FriendStatus.PENDING,
      introduce: 'Kết bạn nhé!',
    },
    {
      senderId: users[7].id,
      receiverId: users[1].id,
      status: FriendStatus.ACCEPTED,
      introduce: 'Mình là bạn cùng lớp',
    },
    {
      senderId: users[5].id,
      receiverId: users[7].id,
      status: FriendStatus.ACCEPTED,
      introduce: 'Kết bạn nhé!',
    },
    {
      senderId: users[8].id,
      receiverId: users[2].id,
      status: FriendStatus.PENDING,
      introduce: 'Mình là bạn của Văn Minh',
    },
    {
      senderId: users[8].id,
      receiverId: users[6].id,
      status: FriendStatus.ACCEPTED,
      introduce: 'Kết bạn nhé!',
    },
    {
      senderId: users[9].id,
      receiverId: users[0].id,
      status: FriendStatus.ACCEPTED,
      introduce: 'Mình là bạn học của Văn Minh',
    },
    {
      senderId: users[9].id,
      receiverId: users[2].id,
      status: FriendStatus.PENDING,
      introduce: 'Mình là bạn của Văn Minh',
    },
    {
      senderId: users[10].id,
      receiverId: users[1].id,
      status: FriendStatus.ACCEPTED,
      introduce: 'Mình là bạn cùng lớp Văn Minh',
    },
    {
      senderId: users[10].id,
      receiverId: users[4].id,
      status: FriendStatus.PENDING,
      introduce: 'Kết bạn nhé!',
    },
    {
      senderId: users[11].id,
      receiverId: users[3].id,
      status: FriendStatus.ACCEPTED,
      introduce: 'Mình là bạn cùng khóa',
    },
    {
      senderId: users[5].id,
      receiverId: users[11].id,
      status: FriendStatus.PENDING,
      introduce: 'Kết bạn nhé!',
    },
    {
      senderId: users[12].id,
      receiverId: users[0].id,
      status: FriendStatus.PENDING,
      introduce: 'Mình là bạn của Văn Minh',
    },
    {
      senderId: users[12].id,
      receiverId: users[10].id,
      status: FriendStatus.ACCEPTED,
      introduce: 'Kết bạn nhé!',
    },
    {
      senderId: users[13].id,
      receiverId: users[2].id,
      status: FriendStatus.ACCEPTED,
      introduce: 'Mình là bạn cùng lớp',
    },
    {
      senderId: users[13].id,
      receiverId: users[9].id,
      status: FriendStatus.BLOCKED,
      introduce: 'Kết bạn nhé!',
    },
  ];

  for (const friendship of friendships) {
    await prisma.friend.create({
      data: friendship,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

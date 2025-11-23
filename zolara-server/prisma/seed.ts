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
      bio: 'Software Developer - @nvminh162',
      profilePictureUrl:
        'https://avatars.githubusercontent.com/u/121565657?v=4',
      statusMessage: 'Live, Love, Travel, Gym 🌍✈️',
      coverImgUrl:
        'https://cover-talk.zadn.vn/d/7/5/d/6/8b20eca05f9660b6d4e1596ac2dc009c.jpg',
      password: '123456789',
    },
    {
      id: 'cea3f6a0-b3bf-4abe-9266-7a3a6fc29173',
      email: 'trungnguyenwork123@gmail.com',
      phoneNumber: '0394757329',
      fullName: 'Nguyễn Trung Nguyên',
      dateOfBirth: new Date('2004-07-20'),
      gender: Gender.FEMALE,
      bio: 'I love Java',
      profilePictureUrl:
        'https://avatars.githubusercontent.com/u/126145466?v=4',
      statusMessage: 'Music is life 🎵🎨',
      coverImgUrl:
        'https://cover-talk.zadn.vn/d/7/5/d/6/8b20eca05f9660b6d4e1596ac2dc009c.jpg',
      password: '123456789',
    },
    {
      id: '43c307df-1cf7-407f-85e4-21f16a4e3bf9',
      email: 'gdragon@gmail.com',
      phoneNumber: '0867115183',
      fullName: 'GDragon',
      dateOfBirth: new Date('2000-09-12'),
      gender: Gender.MALE,
      bio: 'Too Fast To Live, Too Young To Die',
      profilePictureUrl:
        'https://hips.hearstapps.com/hmg-prod/images/lead-67b7ede03f159.png?crop=0.495xw:0.990xh;0,0.00977xh&resize=1120:*',
      statusMessage: 'No pain, no gain 💪🏃',
      coverImgUrl:
        'https://assets.cticket.vn/tix/gdragon-2025-world-tour-ubermensch-in-hanoi-presented-by-vpbank/Slide%20Event%20Detail%203328x1844.webp',
      password: '123456789',
    },
    {
      id: '1cc1b368-02e1-44a7-87c1-17ab9620bb5f',
      email: 'lisa@gmail.com',
      phoneNumber: '0794887283',
      fullName: 'Lisa',
      dateOfBirth: new Date('2001-12-25'),
      gender: Gender.FEMALE,
      bio: 'LISA | OFFICIAL ZOLARA',
      profilePictureUrl:
        'https://pm1.aminoapps.com/7488/47f03ba676bb355e58a9f05ba22d82865f195fa5r1-540-633v2_hq.jpg',
      statusMessage: 'Words paint pictures 📚✍️',
      coverImgUrl:
        'https://wallpapers.com/images/hd/black-dresses-blackpink-desktop-3dcpt7p1kgu54lty.jpg',
      password: '123456789',
    },
    {
      id: '300bc485-d342-442e-aa08-95b754ba901d',
      email: 'taismile@gmail.com',
      phoneNumber: '0918262768',
      fullName: 'Tài Smile',
      dateOfBirth: new Date('1999-03-08'),
      gender: Gender.MALE,
      bio: 'I love Bolero',
      profilePictureUrl:
        'https://photo-resize-zmp3.zadn.vn/w600_r1x1_jpeg/avatars/7/0/704b27084030f0e97ce3ce3e5953e9e5_1510885710.jpg',
      statusMessage: 'Think different, build different 🚀',
      coverImgUrl:
        'https://s2.dmcdn.net/v/QoeSS1epFN0a5p4R2/x720',
      password: '123456789',
    },
    {
      id: '3d09a459-8398-4ec8-ba0f-ffb881f77632',
      email: 'rose@gmail.com',
      phoneNumber: '0708469359',
      fullName: 'Rosé',
      dateOfBirth: new Date('2002-11-14'),
      gender: Gender.FEMALE,
      bio: 'ROSÉ | OFFICIAL ZOLARA',
      profilePictureUrl:
        'https://instagram.fsgn5-15.fna.fbcdn.net/v/t51.2885-19/466690191_890914946502736_8124163249516618952_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fsgn5-15.fna.fbcdn.net&_nc_cat=1&_nc_oc=Q6cZ2QFUSlnpzs0fwyn9ciBN7kFQ72oXtXBaiLiLlSsyX81WwfSzJ2Ci9boBnrjK9rLasY1huK-nujku1H5_ZOVXTH7F&_nc_ohc=pfC5mpG6zN4Q7kNvwHX6_ge&_nc_gid=lBxtWHFTgO0GK5tdOHBmAw&edm=APoiHPcBAAAA&ccb=7-5&oh=00_AfjZDhBXRCHFAO_iljajnlQIbWKwImFKNosZSaK3Z390Sg&oe=692895F7&_nc_sid=22de04',
      statusMessage: 'Baking happiness 🧁🍰',
      coverImgUrl:
        'https://wallpapers.com/images/hd/black-dresses-blackpink-desktop-3dcpt7p1kgu54lty.jpg',
      password: '123456789',
    },
    {
      id: '422a4298-58d6-41d9-a28e-4025c19baf3a',
      email: 'taeyang@gmail.com',
      phoneNumber: '0338673029',
      fullName: 'Taeyang',
      dateOfBirth: new Date('2000-06-30'),
      gender: Gender.MALE,
      bio: 'TAEYANG | OFFICIAL ZOLARA',
      profilePictureUrl:
        'https://image-cdn.nct.vn/singer/avatar/2023/08/10/a/5/f/1/65191_600.jpg',
      statusMessage: 'GG EZ 🎮🏆',
      coverImgUrl:
        'https://wallpapers.com/images/hd/bigbang-in-the-city-road-g3rjreohayn5k3ev.jpg',
      password: '123456789',
    },
    {
      id: '84cc97a1-be78-4ae9-975b-efe8328fe015',
      email: 'jennie@gmail.com',
      phoneNumber: '0978901234',
      fullName: 'Jennie Kim',
      dateOfBirth: new Date('2001-04-18'),
      gender: Gender.FEMALE,
      bio: 'JENNIE | OFFICIAL ZOLARA',
      profilePictureUrl:
        'https://instagram.fsgn5-5.fna.fbcdn.net/v/t51.2885-19/579720971_17912062470246788_5217630256238122715_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fsgn5-5.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QEC6He7CKOU9IeRAUAB1cdyv8Xfn0-MIJvnjcItQC0BHUdLEyE9kbmPL30lPeFxdJ4xYMBvIdXIGN4JOpo_5EkO&_nc_ohc=6jbUwNFbWuIQ7kNvwEm6Oec&_nc_gid=T9U-w8LWVLz1Vze2H7p2tQ&edm=APoiHPcBAAAA&ccb=7-5&oh=00_AfiRGzARiCqsY2WtU9zyJALSgyyuRK5xJ32yP3iVNCPRiA&oe=69289D07&_nc_sid=22de04',
      statusMessage: 'Style is eternal 👗💄',
      coverImgUrl:
        'https://wallpapers.com/images/hd/black-dresses-blackpink-desktop-3dcpt7p1kgu54lty.jpg',
      password: '123456789',
    },
    {
      id: 'ac3fe11d-01bf-4ef0-9992-661e621253c2',
      email: 'daesung@gmail.com',
      phoneNumber: '0989012345',
      fullName: 'Daesung',
      dateOfBirth: new Date('1999-08-22'),
      gender: Gender.MALE,
      bio: 'DAESUNG | OFFICIAL ZOLARA',
      profilePictureUrl:
        'https://i.mydramalist.com/RBPAVV_5c.jpg',
      statusMessage: 'Frame the moment 📸🎬',
      coverImgUrl:
        'https://wallpapers.com/images/hd/bigbang-in-the-city-road-g3rjreohayn5k3ev.jpg',
      password: '123456789',
    },
    {
      id: 'b5c8d7e6-f5e4-4d3c-b2a1-0f9e8d7c6b5a',
      email: 'jisoo@gmail.com',
      phoneNumber: '0990123456',
      fullName: 'Jisoo',
      dateOfBirth: new Date('2000-02-28'),
      gender: Gender.FEMALE,
      bio: 'JISOO | OFFICIAL',
      profilePictureUrl: "https://preview.redd.it/250214-jisoo-amortage-mini-album-release-photos-v0-z0n9tnvgf2je1.jpg?width=640&crop=smart&auto=webp&s=796f4cf4481512f72188e911d10a767e6a1e091a",
      statusMessage: 'Green living 🌱🌍',
      coverImgUrl: "https://images.augustman.com/wp-content/uploads/sites/6/2023/04/01170503/jisoo-solo-blackpink-2.jpeg",
      password: '123456789',
    },
    {
      id: 'c6d7e8f9-a0b1-2c3d-4e5f-6a7b8c9d0e1f',
      email: 'ishowspeed@gmail.com',
      phoneNumber: '0901234560',
      fullName: 'Ishowspeed',
      dateOfBirth: new Date('1998-10-05'),
      gender: Gender.MALE,
      bio: 'I love Cr7',
      profilePictureUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIS4VuIKs3YjObiyW8M0NzDAkx8BEhLzLhEA&s",
      statusMessage: 'AI will change the world 🤖💡',
      coverImgUrl: "https://wallpapers.com/images/hd/ishowspeed-o8thh1dftcpzzj27.jpg",
      password: '123456789',
    },
    {
      id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a',
      email: 'taylor@gmail.com',
      phoneNumber: '0912345601',
      fullName: 'Taylor Swift',
      dateOfBirth: new Date('2001-07-16'),
      gender: Gender.FEMALE,
      bio: 'Taylor Swift | OFFICIAL ZOLARA',
      profilePictureUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyJAJsPlTFwgm5GFnATrRbOjtxuGVSYgJOng&s",
      statusMessage: 'Namaste 🧘‍♀️✨',
      coverImgUrl: "https://miro.medium.com/v2/1*wHsM4lnTwnnkszc-depMbA.jpeg",
      password: '123456789',
    },
    {
      id: 'e8f9a0b1-c2d3-4e5f-6a7b-8c9d0e1f2a3b',
      email: 'cistiano@gmail.com',
      phoneNumber: '0923456702',
      fullName: 'Cristiano',
      dateOfBirth: new Date('1999-01-20'),
      gender: Gender.MALE,
      bio: 'Cristiano Ronaldo | OFFICIAL ZOLARA',
      profilePictureUrl: "https://instagram.fsgn5-15.fna.fbcdn.net/v/t51.2885-19/472007201_1142000150877579_994350541752907763_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fsgn5-15.fna.fbcdn.net&_nc_cat=1&_nc_oc=Q6cZ2QHH2okSPnALro1FBKWLEAh_PiQQfqrnz--J1z4YDyAOgCjgWcbpjDeB_NRlfvzqdrv5j2uD558n-X3dyIt24QVC&_nc_ohc=u6aMCm3RG2sQ7kNvwE4RSMq&_nc_gid=lkSAQduszMvin-QkejAmrg&edm=AIhb9MIBAAAA&ccb=7-5&oh=00_AfiJL-aeqj_2PXMMfooAR2NvAbDxCU54x2It_JNSloDDkA&oe=6928761E&_nc_sid=8aafe2",
      statusMessage: 'Think big, start small 💼📈',
      coverImgUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvao_E0DInTIdltvtB8mLtPvfuXTb41X93lQ&s",
      password: '123456789',
    },
    {
      id: 'f9a0b1c2-d3e4-5f6a-7b8c-9d0e1f2a3b4c',
      email: 'messi@gmail.com',
      phoneNumber: '0934567803',
      fullName: 'Leo Messi',
      dateOfBirth: new Date('2000-12-10'),
      gender: Gender.MALE,
      bio: 'MESSI | OFFICIAL ZOLARA',
      profilePictureUrl: "https://instagram.fsgn5-15.fna.fbcdn.net/v/t51.2885-19/424905549_7243065989106669_45026390061580919_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fsgn5-15.fna.fbcdn.net&_nc_cat=1&_nc_oc=Q6cZ2QGCbVPgbYommrYw9kOKMcU2pjhxGKagxwdAotlP-a2xzCpP8Ipc5XeYDK9Q1Epgf0rDNDKcUyk8yuMNdZk_MHuM&_nc_ohc=z5_26xjnGQ0Q7kNvwHwxNfc&_nc_gid=3Yk3hR-Tn4WlTuHMBfCcSA&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfhSTX5tUohIy9npdEPqlux6E678vSTs2Hcac0CTWRJGog&oe=6928A0B1&_nc_sid=7a9f4b",
      statusMessage: 'Love all creatures 🐾🦋',
      coverImgUrl: "https://cdn.theatlantic.com/thumbor/cGrcH5XD4XEGwSpOI7VSnoToduQ=/8x106:3930x2165/960x504/filters:watermark(https://cdn.theatlantic.com/media/files/badge_2x.png,-20,20,0,33)/media/img/mt/2022/12/GettyImages_1245714145/original.jpg",
      password: '123456789',
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
      receiverId: users[5].id,
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

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { InputJsonValue } from '../message/interfaces/prisma-json.interface';

/**
 * Helper function to convert any object to Prisma-compatible JSON
 */
function toPrismaJson<T>(data: T): InputJsonValue {
  return JSON.parse(JSON.stringify(data)) as InputJsonValue;
}

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo bài đăng mới
   */
  async createPost(userId: string, createPostDto: CreatePostDto) {
    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prepare media data
    const mediaData = createPostDto.media
      ? toPrismaJson(createPostDto.media)
      : null;

    // Create post
    const post = await this.prisma.post.create({
      data: {
        userId,
        content: createPostDto.content || null,
        media: mediaData,
        privacyLevel: createPostDto.privacyLevel || 'public',
      },
      include: {
        user: {
          include: {
            userInfo: true,
          },
        },
        reactions: {
          include: {
            user: {
              include: {
                userInfo: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              include: {
                userInfo: true,
              },
            },
          },
          take: 5, // Get latest 5 comments
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
            hiddenBy: true,
          },
        },
      },
    });

    return post;
  }

  /**
   * Lấy danh sách bài đăng của bản thân và bạn bè
   */
  async getPostsFromMeAndFriends(
    queryDto: QueryPostsDto,
    currentUserId: string,
  ) {
    const { page = 1, limit = 20, sortBy, sortOrder } = queryDto;
    const skip = (page - 1) * limit;

    // Get list of friends (ACCEPTED status)
    const friendships = await this.prisma.friend.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
            status: 'ACCEPTED',
          },
          {
            receiverId: currentUserId,
            status: 'ACCEPTED',
          },
        ],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    // Extract friend IDs
    const friendIds = friendships.map((friendship) =>
      friendship.senderId === currentUserId
        ? friendship.receiverId
        : friendship.senderId,
    );

    // Include current user ID
    const userIds = [currentUserId, ...friendIds];

    // Build where clause - posts from current user and friends
    const where: any = {
      userId: {
        in: userIds,
      },
    };

    // Get posts
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy || 'createdAt']: sortOrder || 'desc',
        },
        include: {
          user: {
            include: {
              userInfo: true,
            },
          },
          reactions: {
            include: {
              user: {
                include: {
                  userInfo: true,
                },
              },
            },
          },
          comments: {
            include: {
              user: {
                include: {
                  userInfo: true,
                },
              },
            },
            take: 5,
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
              hiddenBy: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    // Filter posts based on privacy
    // Logic:
    // - Posts của chính mình: hiển thị tất cả (public, friends, private)
    // - Posts của bạn bè: chỉ hiển thị public và friends (không hiển thị private)
    const filteredPosts = await this.filterPostsByPrivacy(posts, currentUserId);

    // Note: total count is approximate since we filter by privacy after querying
    // For accurate count, we would need to filter all posts first, but that's expensive
    return {
      data: filteredPosts,
      pagination: {
        page,
        limit,
        total: total, // Total from database (may be slightly higher after privacy filtering)
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy danh sách bài đăng
   */
  async getPosts(queryDto: QueryPostsDto, currentUserId?: string) {
    const { page = 1, limit = 20, userId, sortBy, sortOrder } = queryDto;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (userId) {
      where.userId = userId;
      
      // Nếu query posts của user khác (không phải chính mình), chỉ lấy public posts
      if (currentUserId && userId !== currentUserId) {
        where.privacyLevel = 'public';
      }
      // Nếu query posts của chính mình, lấy tất cả (không filter privacyLevel)
    }

    // Get posts
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy || 'createdAt']: sortOrder || 'desc',
        },
        include: {
          user: {
            include: {
              userInfo: true,
            },
          },
          reactions: {
            include: {
              user: {
                include: {
                  userInfo: true,
                },
              },
            },
          },
          comments: {
            include: {
              user: {
                include: {
                  userInfo: true,
                },
              },
            },
            take: 5,
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
              hiddenBy: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    // Filter posts based on privacy and relationship
    // Nếu là posts của chính mình (userId === currentUserId), không cần filter
    let filteredPosts = posts;
    if (currentUserId && userId !== currentUserId) {
      // Chỉ filter khi xem posts của người khác
      // Nhưng vì đã filter ở where clause (chỉ lấy public), nên không cần filter lại
      filteredPosts = posts; // Tất cả đã là public rồi
    } else if (currentUserId && !userId) {
      // Nếu không có userId (query tất cả posts), cần filter
      filteredPosts = await this.filterPostsByPrivacy(posts, currentUserId);
    }
    // Nếu userId === currentUserId, không filter (lấy tất cả posts của chính mình)

    return {
      data: filteredPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy bài đăng theo ID
   */
  async getPostById(postId: string, currentUserId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          include: {
            userInfo: true,
          },
        },
        reactions: {
          include: {
            user: {
              include: {
                userInfo: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              include: {
                userInfo: true,
              },
            },
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
            hiddenBy: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check privacy
    if (currentUserId) {
      const canView = await this.canViewPost(post, currentUserId);
      if (!canView) {
        throw new ForbiddenException('You do not have permission to view this post');
      }
    }

    return post;
  }

  /**
   * Cập nhật bài đăng
   */
  async updatePost(postId: string, userId: string, updatePostDto: UpdatePostDto) {
    // Check if post exists and user owns it
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    // Prepare update data
    const updateData: any = {};

    if (updatePostDto.content !== undefined) {
      updateData.content = updatePostDto.content || null;
    }

    if (updatePostDto.media !== undefined) {
      // If media is provided (even empty array), update it
      // Empty array means remove all media
      updateData.media = Array.isArray(updatePostDto.media)
        ? (updatePostDto.media.length > 0 ? toPrismaJson(updatePostDto.media) : null)
        : null;
    }

    if (updatePostDto.privacyLevel !== undefined) {
      updateData.privacyLevel = updatePostDto.privacyLevel;
    }

    // Update post
    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        user: {
          include: {
            userInfo: true,
          },
        },
        reactions: {
          include: {
            user: {
              include: {
                userInfo: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              include: {
                userInfo: true,
              },
            },
          },
          take: 5,
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
            hiddenBy: true,
          },
        },
      },
    });

    return updatedPost;
  }

  /**
   * Xóa bài đăng
   */
  async deletePost(postId: string, userId: string) {
    // Check if post exists and user owns it
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    // Delete related records first (PostReactions and Comments)
    // This ensures deletion works even if cascade is not set in database
    await this.prisma.$transaction(async (tx) => {
      // Delete all reactions for this post
      await tx.postReaction.deleteMany({
        where: { postId },
      });

      // Delete all comments for this post
      await tx.comment.deleteMany({
        where: { postId },
      });

      // Delete all hidden posts for this post
      await tx.hiddenPost.deleteMany({
        where: { postId },
      });

      // Finally, delete the post itself
      await tx.post.delete({
        where: { id: postId },
      });
    });

    return { message: 'Post deleted successfully' };
  }

  /**
   * Kiểm tra quyền xem bài đăng dựa trên privacy level
   */
  private async canViewPost(post: any, currentUserId: string): Promise<boolean> {
    // If it's the owner, always can view
    if (post.userId === currentUserId) {
      return true;
    }

    // Check privacy level
    if (post.privacyLevel === 'public') {
      return true;
    }

    if (post.privacyLevel === 'private') {
      return false;
    }

    if (post.privacyLevel === 'friends') {
      // Check if users are friends
      const friendship = await this.prisma.friend.findFirst({
        where: {
          OR: [
            {
              senderId: post.userId,
              receiverId: currentUserId,
            },
            {
              senderId: currentUserId,
              receiverId: post.userId,
            },
          ],
          status: 'ACCEPTED',
        },
      });

      return !!friendship;
    }

    return false;
  }

  /**
   * Lọc bài đăng theo privacy và relationship
   */
  private async filterPostsByPrivacy(
    posts: any[],
    currentUserId: string,
  ): Promise<any[]> {
    const filteredPosts: any[] = [];

    for (const post of posts) {
      const canView = await this.canViewPost(post, currentUserId);
      if (canView) {
        filteredPosts.push(post);
      }
    }

    return filteredPosts;
  }

  /**
   * Toggle like reaction on a post
   */
  async toggleLikePost(postId: string, userId: string) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user already liked this post
    const existingReaction = await this.prisma.postReaction.findFirst({
      where: {
        postId,
        userId,
        reactionType: 'LIKE',
      },
    });

    if (existingReaction) {
      // Unlike: Delete the reaction
      await this.prisma.postReaction.delete({
        where: { id: existingReaction.id },
      });
      return { liked: false, message: 'Post unliked' };
    } else {
      // Like: Create new reaction
      await this.prisma.postReaction.create({
        data: {
          postId,
          userId,
          reactionType: 'LIKE',
        },
      });
      return { liked: true, message: 'Post liked' };
    }
  }

  /**
   * Get comments for a post
   */
  async getPostComments(postId: string, queryDto: QueryCommentsDto) {
    const { page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Get comments
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId },
        skip,
        take: limit,
        orderBy: { id: 'desc' }, // Sort by id (newest first based on UUID generation)
        include: {
          user: {
            include: {
              userInfo: true,
            },
          },
        },
      }),
      this.prisma.comment.count({ where: { postId } }),
    ]);

    return {
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a comment on a post
   */
  async createComment(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Create comment
    const comment = await this.prisma.comment.create({
      data: {
        postId,
        userId,
        content: createCommentDto.content,
        repliedTo: createCommentDto.repliedTo || null,
      },
      include: {
        user: {
          include: {
            userInfo: true,
          },
        },
      },
    });

    return comment;
  }
}


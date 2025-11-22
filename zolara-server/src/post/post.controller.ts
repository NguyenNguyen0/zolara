import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto, PostSortBy, PostSortOrder } from './dto/query-posts.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { StorageService } from '../storage/storage.service';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Tạo bài đăng mới
   * POST /posts
   */
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
    @Request() req: Request,
  ) {
    const userId = req['user'].sub;

    // Upload media files if provided
    let mediaItems = createPostDto.media || [];
    if (files && files.length > 0) {
      const uploadedFiles = await this.storageService.uploadFiles(
        files,
        'posts-media',
        `posts/${userId}`,
      );

      // Convert uploaded files to media items
      const fileMediaItems = uploadedFiles.map((file) => ({
        url: file.url,
        type: this.getMediaType(file.mimeType || file.contentType || ''),
        metadata: {
          fileName: file.fileName,
          fileSize: file.size,
          mimeType: file.mimeType,
          contentType: file.contentType,
        },
      }));

      mediaItems = [...mediaItems, ...fileMediaItems];
    }

    // Create post with media
    const postData: CreatePostDto = {
      ...createPostDto,
      media: mediaItems.length > 0 ? mediaItems : undefined,
    };

    return this.postService.createPost(userId, postData);
  }

  /**
   * Lấy danh sách bài đăng của bản thân và bạn bè
   * GET /posts/feed
   */
  @Get('feed')
  async getFeedPosts(@Query() queryDto: QueryPostsDto, @Request() req: Request) {
    const currentUserId = req['user'].sub;
    // Ensure sorting by newest first
    const feedQuery: QueryPostsDto = {
      ...queryDto,
      sortBy: queryDto.sortBy || PostSortBy.CREATED_AT,
      sortOrder: queryDto.sortOrder || PostSortOrder.DESC,
    };
    return this.postService.getPostsFromMeAndFriends(feedQuery, currentUserId);
  }

  /**
   * Lấy danh sách bài đăng của người dùng hiện tại
   * GET /posts/my
   */
  @Get('my')
  async getMyPosts(@Query() queryDto: QueryPostsDto, @Request() req: Request) {
    const currentUserId = req['user'].sub;
    // Override userId to current user and ensure sorting by newest first
    const myPostsQuery: QueryPostsDto = {
      ...queryDto,
      userId: currentUserId,
      sortBy: queryDto.sortBy || PostSortBy.CREATED_AT,
      sortOrder: queryDto.sortOrder || PostSortOrder.DESC,
    };
    return this.postService.getPosts(myPostsQuery, currentUserId);
  }

  /**
   * Lấy danh sách bài đăng
   * GET /posts
   */
  @Get()
  async getPosts(@Query() queryDto: QueryPostsDto, @Request() req: Request) {
    const currentUserId = req['user']?.sub;
    // Ensure default sorting by newest first
    const postsQuery: QueryPostsDto = {
      ...queryDto,
      sortBy: queryDto.sortBy || PostSortBy.CREATED_AT,
      sortOrder: queryDto.sortOrder || PostSortOrder.DESC,
    };
    return this.postService.getPosts(postsQuery, currentUserId);
  }

  /**
   * Toggle like reaction on a post
   * POST /posts/:id/like
   * NOTE: Must be before @Get(':id') to avoid route conflict
   */
  @Post(':id/like')
  async toggleLikePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: Request,
  ) {
    const userId = req['user'].sub;
    return this.postService.toggleLikePost(id, userId);
  }

  /**
   * Get comments for a post
   * GET /posts/:id/comments
   * NOTE: Must be before @Get(':id') to avoid route conflict
   */
  @Get(':id/comments')
  async getPostComments(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() queryDto: QueryCommentsDto,
  ) {
    return this.postService.getPostComments(id, queryDto);
  }

  /**
   * Create a comment on a post
   * POST /posts/:id/comments
   * NOTE: Must be before @Post(':id') to avoid route conflict
   */
  @Post(':id/comments')
  async createComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: Request,
  ) {
    const userId = req['user'].sub;
    return this.postService.createComment(id, userId, createCommentDto);
  }

  /**
   * Lấy bài đăng theo ID
   * GET /posts/:id
   */
  @Get(':id')
  async getPostById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: Request,
  ) {
    const currentUserId = req['user']?.sub;
    return this.postService.getPostById(id, currentUserId);
  }

  /**
   * Cập nhật bài đăng
   * PUT /posts/:id
   */
  @Put(':id')
  @UseInterceptors(FilesInterceptor('files', 10))
  async updatePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
    @Request() req: Request,
  ) {
    const userId = req['user'].sub;

    // Upload new media files if provided
    let mediaItems = updatePostDto.media || [];
    if (files && files.length > 0) {
      const uploadedFiles = await this.storageService.uploadFiles(
        files,
        'posts-media',
        `posts/${userId}`,
      );

      // Convert uploaded files to media items
      const fileMediaItems = uploadedFiles.map((file) => ({
        url: file.url,
        type: this.getMediaType(file.mimeType || file.contentType || ''),
        metadata: {
          fileName: file.fileName,
          fileSize: file.size,
          mimeType: file.mimeType,
          contentType: file.contentType,
        },
      }));

      mediaItems = [...mediaItems, ...fileMediaItems];
    }

    // Update post with media
    // Always include media field when updating (even if empty array to remove all media)
    const updateData: UpdatePostDto = {
      ...updatePostDto,
      media: mediaItems, // Send array (can be empty to remove all media)
    };

    return this.postService.updatePost(id, userId, updateData);
  }

  /**
   * Xóa bài đăng
   * DELETE /posts/:id
   */
  @Delete(':id')
  async deletePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: Request,
  ) {
    const userId = req['user'].sub;
    return this.postService.deletePost(id, userId);
  }

  /**
   * Helper method to determine media type from MIME type
   */
  private getMediaType(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType.startsWith('video/')) {
      return 'video';
    } else if (mimeType.startsWith('audio/')) {
      return 'audio';
    } else {
      return 'other';
    }
  }
}


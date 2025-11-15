import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MessageService } from './message.service';

import { UserMessageDto } from './dtos/user-message.dto';
import { GroupMessageDto } from './dtos/group-message.dto';
import { CreateReactionDto } from './dtos/create-reaction.dto';
import { MessageMediaUploadDto } from './dtos/message-media.dto';
import { ForwardMessageDto } from './dtos/forward-message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/conversations')
  async getConversationList(
    @Request() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const requestUserId = req['user'].sub;
    console.log('Getting conversation list for user:', requestUserId);
    return this.messageService.getConversationList(requestUserId, page, limit);
  }

  @Get('/group/:groupId')
  async getGroupMessages(
    @Request() req: Request,
    @Param('groupId') groupId: string,
    @Query('page') page = 1,
  ) {
    const requestUserId = req['user'].sub;
    return this.messageService.getGroupMessages(requestUserId, groupId, page);
  }

  @Get('/group/:groupId/search')
  async findMessagesInGroup(
    @Request() req: Request,
    @Param('groupId') groupId: string,
    @Query('searchText') searchText: string,
    @Query('page', ParseIntPipe) page = 1,
  ) {
    const requestUserId = req['user'].sub;
    return this.messageService.findMessagesInGroup(
      requestUserId,
      groupId,
      searchText,
      page,
    );
  }

  @Get('/user/:userIdB/search')
  async findMessagesInUser(
    @Request() req: Request,
    @Param('userIdB', ParseUUIDPipe) userIdB: string,
    @Query('searchText') searchText: string,
    @Query('page', ParseIntPipe) page = 1,
  ) {
    const requestUserId = req['user'].sub;
    return this.messageService.findMessagesInUser(
      requestUserId,
      userIdB,
      searchText,
      page,
    );
  }

  @Get('/user/:userIdB')
  async getUserMessages(
    @Request() req: Request,
    @Param('userIdB', ParseUUIDPipe) userIdB: string,
    @Query('page') page = 1,
  ) {
    const requestUserId = req['user'].sub;
    return this.messageService.getUserMessages(requestUserId, userIdB, page);
  }

  @Post('/user')
  @UseInterceptors(FilesInterceptor('files', 10)) // Allow up to 10 files
  async createUserMessage(
    @Body() messageBody: UserMessageDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    const createdMessage = await this.messageService.createUserMessageWithMedia(
      messageBody,
      files,
      requestUserId,
    );

    // Thông báo qua WebSocket được xử lý tự động trong MessageService

    return createdMessage;
  }

  @Post('/group')
  @UseInterceptors(FilesInterceptor('files', 10)) // Allow up to 10 files
  async createGroupMessage(
    @Body() messageBody: GroupMessageDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    const createdMessage =
      await this.messageService.createGroupMessageWithMedia(
        messageBody,
        files,
        requestUserId,
      );

    // Thông báo qua WebSocket được xử lý tự động trong MessageService

    return createdMessage;
  }

  @Patch('/recall/:messageId')
  async recallMessage(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    return this.messageService.recallMessage(messageId, requestUserId);
  }

  @Delete('/deleted-self-side/:messageId')
  async deleteMessage(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    return this.messageService.deleteMessageSelfSide(messageId, requestUserId);
  }

  @Post('read/:messageId')
  async readMessage(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Request() req: Request,
  ) {
    try {
      const requestUserId = req['user'].sub;
      const result = await this.messageService.readMessage(
        messageId,
        requestUserId,
      );

      // Nếu result là null, trả về response thành công nhưng với success: false
      if (!result) {
        return {
          success: false,
          message: 'Message was not marked as read',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error(
        `Error marking message ${messageId} as read: ${error.message}`,
      );
      return {
        success: false,
        message: 'Failed to mark message as read',
        error: error.message,
      };
    }
  }

  @Patch('/unread/:messageId')
  async unreadMessage(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    return this.messageService.unreadMessage(messageId, requestUserId);
  }

  @Post('/reaction')
  async addReaction(
    @Body() reaction: CreateReactionDto,
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    return this.messageService.addReaction(reaction, requestUserId);
  }

  @Delete('/reaction/:messageId')
  async removeReaction(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    return this.messageService.removeReaction(messageId, requestUserId);
  }

  @Post('/media')
  @UseInterceptors(FilesInterceptor('files', 10)) // Allow up to 10 files
  async uploadMessageMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() messageData: MessageMediaUploadDto,
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    const result = await this.messageService.uploadMessageMedia(
      files,
      messageData,
      requestUserId,
    );

    // Media upload is handled by the message service
    // No need to notify via WebSocket as clients will receive updates through regular message events

    return result;
  }

  @Post('/forward')
  async forwardMessage(
    @Body() forwardData: ForwardMessageDto,
    @Request() req: Request,
  ) {
    const requestUserId = req['user'].sub;
    const results = await this.messageService.forwardMessage(
      forwardData,
      requestUserId,
    );

    // Thông báo qua WebSocket được xử lý tự động trong MessageService

    return results;
  }

  @Post('/read-all/:type/:targetId')
  @HttpCode(200)
  async markAllAsRead(
    @Param('type') type: 'USER' | 'GROUP',
    @Param('targetId', ParseUUIDPipe) targetId: string,
    @Request() req: Request,
  ) {
    try {
      const requestUserId = req['user'].sub;
      const result = await this.messageService.markAllAsRead(
        requestUserId,
        targetId,
        type,
      );

      return result;
    } catch (error) {
      console.error(`Error marking all messages as read: ${error.message}`);
      return {
        success: false,
        message: 'Failed to mark messages as read',
        error: error.message,
      };
    }
  }
}

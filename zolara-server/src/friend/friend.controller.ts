import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('request')
  async sendFriendRequest(
    @Request() req: Request,
    @Body() dto: SendFriendRequestDto,
  ) {
    const userId = req['user'].sub;
    return this.friendService.sendFriendRequest(userId, dto);
  }

  @Put('respond')
  async respondToFriendRequest(
    @Request() req: Request,
    @Body() dto: RespondFriendRequestDto,
  ) {
    const userId = req['user'].sub;
    return this.friendService.respondToFriendRequest(userId, dto);
  }

  @Post('block/:targetId')
  async blockUser(
    @Request() req: Request,
    @Param('targetId') targetId: string,
  ) {
    const userId = req['user'].sub;
    return this.friendService.blockUser(userId, targetId);
  }

  @Delete('block/:targetId')
  async unblockUser(
    @Request() req: Request,
    @Param('targetId') targetId: string,
  ) {
    const userId = req['user'].sub;
    return this.friendService.unblockUser(userId, targetId);
  }

  @Get('requests/received')
  async getReceivedFriendRequests(@Request() req: Request) {
    const userId = req['user'].sub;
    return this.friendService.getReceivedFriendRequests(userId);
  }

  @Get('requests/sent')
  async getSentFriendRequests(@Request() req: Request) {
    const userId = req['user'].sub;
    return this.friendService.getSentFriendRequests(userId);
  }

  @Get('list')
  async getFriendList(@Request() req: Request) {
    const userId = req['user'].sub;
    return this.friendService.getFriendList(userId);
  }

  @Get('blocked')
  async getBlockedUsers(@Request() req: Request) {
    const userId = req['user'].sub;
    return this.friendService.getBlockedUsers(userId);
  }

  @Delete(':friendId')
  async unfriend(@Request() req: Request, @Param('friendId') friendId: string) {
    const userId = req['user'].sub;
    return this.friendService.unfriend(userId, friendId);
  }

  @Delete('request/:requestId')
  async cancelFriendRequest(
    @Request() req: Request,
    @Param('requestId') requestId: string,
  ) {
    const userId = req['user'].sub;
    return this.friendService.cancelFriendRequest(userId, requestId);
  }

  @Get('relationship/:targetId')
  async getRelationship(
    @Request() req: Request,
    @Param('targetId') targetId: string,
  ) {
    const userId = req['user'].sub;
    return this.friendService.getRelationship(userId, targetId);
  }
}

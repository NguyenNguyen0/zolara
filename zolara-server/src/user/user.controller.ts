import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
  Body,
  Request,
} from '@nestjs/common';

import { UserService } from './user.service';
import { SearchUserDto } from './dto/search-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string, @Request() req: Request) {
    // Extract the current user ID from the request
    const currentUserId = req['user']?.sub;

    // Get user with privacy restrictions based on relationship
    const user = await this.userService.getUserById(id, currentUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get(':id/basic-info')
  async getUserBasicInfo(@Param('id') id: string) {
    const userInfo = await this.userService.getUserBasicInfo(id);
    if (!userInfo) {
      throw new NotFoundException('User info not found');
    }
    return userInfo;
  }

  @Post('search')
  async searchUser(
    @Body() searchUserDto: SearchUserDto,
    @Request() req: Request,
  ) {
    try {
      const currentUserId = req['user']?.sub;
      return await this.userService.searchUserByEmailOrPhone(
        searchUserDto.email,
        searchUserDto.phoneNumber,
        currentUserId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Nếu có lỗi khác, trả về thông báo lỗi dựa trên loại tìm kiếm
      if (searchUserDto.email) {
        throw new NotFoundException(
          'Email chưa đăng ký tài khoản hoặc không cho phép tìm kiếm',
        );
      } else {
        throw new NotFoundException(
          'Số điện thoại chưa đăng ký tài khoản hoặc không cho phép tìm kiếm',
        );
      }
    }
  }
}

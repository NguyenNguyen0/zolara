import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  DashboardResponseDto,
  UserStatisticsDto,
} from './dto/dashboard-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('dashboard')
@UseGuards(AuthGuard, AdminGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats(): Promise<DashboardResponseDto> {
    return await this.dashboardService.getDashboardStats();
  }

  @Get('user-statistics')
  async getUserStatistics(): Promise<UserStatisticsDto> {
    return await this.dashboardService.getUserStatistics();
  }
}

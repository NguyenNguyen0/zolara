import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  DashboardResponseDto,
  UserStatsDto,
  MessageStatsDto,
  CallStatsDto,
  ChartDataDto,
} from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardResponseDto> {
    const [userStats, messageStats, callStats, chartData] = await Promise.all([
      this.getUserStats(),
      this.getMessageStats(),
      this.getCallStats(),
      this.getChartData(),
    ]);

    return {
      userStats,
      messageStats,
      callStats,
      chartData,
      lastUpdated: new Date(),
    };
  }

  private async getUserStats(): Promise<UserStatsDto> {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Active users - users who have been active in the last 24 hours
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalUsers, activeUsers, newUsersToday, newUsersThisWeek] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.userInfo.count({
          where: {
            lastSeen: {
              gte: last24Hours,
            },
          },
        }),
        this.prisma.user.count({
          where: {
            createdAt: {
              gte: startOfToday,
            },
          },
        }),
        this.prisma.user.count({
          where: {
            createdAt: {
              gte: startOfWeek,
            },
          },
        }),
      ]);

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
    };
  }

  private async getMessageStats(): Promise<MessageStatsDto> {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [totalMessages, messagesToday, messagesThisWeek] = await Promise.all([
      this.prisma.message.count(),
      this.prisma.message.count({
        where: {
          createdAt: {
            gte: startOfToday,
          },
        },
      }),
      this.prisma.message.count({
        where: {
          createdAt: {
            gte: startOfWeek,
          },
        },
      }),
    ]);

    return {
      totalMessages,
      messagesToday,
      messagesThisWeek,
    };
  }

  private async getCallStats(): Promise<CallStatsDto> {
    const [totalCalls, activeCalls, avgDurationResult] = await Promise.all([
      this.prisma.call.count(),
      this.prisma.call.count({
        where: {
          status: 'ONGOING',
        },
      }),
      this.prisma.call.aggregate({
        where: {
          status: 'ENDED',
          duration: {
            not: null,
          },
        },
        _avg: {
          duration: true,
        },
      }),
    ]);

    return {
      totalCalls,
      activeCalls,
      averageCallDuration: avgDurationResult._avg.duration || 0,
    };
  }

  private async getChartData(): Promise<ChartDataDto> {
    const [userGrowth, messageActivity, callDistribution] = await Promise.all([
      this.getUserGrowthData(),
      this.getMessageActivityData(),
      this.getCallDistributionData(),
    ]);

    // Performance metrics (mock data for now since we don't have this in DB)
    const performanceMetrics = this.getPerformanceMetrics();

    return {
      userGrowth,
      messageActivity,
      callDistribution,
      performanceMetrics,
    };
  }

  private async getUserGrowthData() {
    const months: Date[] = [];
    const now = new Date();

    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date);
    }

    const labels = months.map((date) =>
      date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    );

    const newUsersPromises = months.map((date) => {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      return this.prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
    });

    const activeUsersPromises = months.map((date) => {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      return this.prisma.userInfo.count({
        where: {
          lastSeen: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
    });

    const [newUsers, activeUsers] = await Promise.all([
      Promise.all(newUsersPromises),
      Promise.all(activeUsersPromises),
    ]);

    return {
      labels,
      newUsers,
      activeUsers,
    };
  }

  private async getMessageActivityData() {
    const days: Date[] = [];
    const now = new Date();

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      days.push(date);
    }

    const labels = days.map((date) =>
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    );

    const messagesPromises = days.map((date) => {
      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
      );

      return this.prisma.message.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });
    });

    const groupMessagesPromises = days.map((date) => {
      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
      );

      return this.prisma.message.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          messageType: 'GROUP',
        },
      });
    });

    const [messages, groupMessages] = await Promise.all([
      Promise.all(messagesPromises),
      Promise.all(groupMessagesPromises),
    ]);

    return {
      labels,
      messages,
      groupMessages,
    };
  }

  private async getCallDistributionData() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get calls from this month
    const calls = await this.prisma.call.findMany({
      where: {
        startedAt: {
          gte: startOfMonth,
        },
      },
      select: {
        type: true,
        groupId: true,
      },
    });

    const distribution = {
      voiceCalls: 0,
      videoCalls: 0,
      groupCalls: 0,
      conferenceCalls: 0,
    };

    calls.forEach((call) => {
      if (call.groupId) {
        distribution.groupCalls++;
      } else if (call.type === 'AUDIO') {
        distribution.voiceCalls++;
      } else if (call.type === 'VIDEO') {
        distribution.videoCalls++;
      }
    });

    // Conference calls could be group calls with more than X participants
    // For now, we'll use a simple logic
    distribution.conferenceCalls = Math.floor(distribution.groupCalls * 0.3);
    distribution.groupCalls =
      distribution.groupCalls - distribution.conferenceCalls;

    return distribution;
  }

  private getPerformanceMetrics() {
    const days: Date[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      days.push(date);
    }

    const labels = days.map((date) =>
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    );

    // Mock data for performance metrics
    // In a real application, you would collect these metrics from monitoring tools
    const responseTime = labels.map(() => Math.floor(Math.random() * 30) + 100);
    const uptime = labels.map(() => 99.9 + Math.random() * 0.09);

    return {
      labels,
      responseTime,
      uptime,
    };
  }
}

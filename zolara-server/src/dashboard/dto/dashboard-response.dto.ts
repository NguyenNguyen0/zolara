export class UserStatsDto {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
}

export class UserRankingDto {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  messagesSent: number;
  callsInitiated: number;
  activeTime: number; // in hours
  friendsCount: number;
  joinedDate: string;
  lastActive: string;
  engagementScore: number;
}

export class UserStatisticsDto {
  userStats: UserStatsDto;
  topUsers: {
    byMessages: UserRankingDto[];
    byCalls: UserRankingDto[];
    byActiveTime: UserRankingDto[];
    byEngagement: UserRankingDto[];
  };
  engagementMetrics: {
    averageSessionTime: number;
    averageMessagesPerUser: number;
    averageCallsPerUser: number;
    mostActiveHour: number;
  };
}

export class MessageStatsDto {
  totalMessages: number;
  messagesToday: number;
  messagesThisWeek: number;
}

export class CallStatsDto {
  totalCalls: number;
  activeCalls: number;
  averageCallDuration: number;
}

export class UserGrowthDto {
  labels: string[];
  newUsers: number[];
  activeUsers: number[];
}

export class MessageActivityDto {
  labels: string[];
  messages: number[];
  groupMessages: number[];
}

export class CallDistributionDto {
  voiceCalls: number;
  videoCalls: number;
  groupCalls: number;
  conferenceCalls: number;
}

export class PerformanceMetricsDto {
  labels: string[];
  responseTime: number[];
  uptime: number[];
}

export class ChartDataDto {
  userGrowth: UserGrowthDto;
  messageActivity: MessageActivityDto;
  callDistribution: CallDistributionDto;
  performanceMetrics: PerformanceMetricsDto;
}

export class DashboardResponseDto {
  userStats: UserStatsDto;
  messageStats: MessageStatsDto;
  callStats: CallStatsDto;
  chartData: ChartDataDto;
  lastUpdated: Date;
}

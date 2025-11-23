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
  groupsJoined: number;
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
    byGroups: UserRankingDto[];
    byActiveTime: UserRankingDto[];
    byEngagement: UserRankingDto[];
  };
  engagementMetrics: {
    averageSessionTime: number;
    averageMessagesPerUser: number;
    averageGroupsPerUser: number;
    mostActiveHour: number;
  };
}

export class MessageStatsDto {
  totalMessages: number;
  messagesToday: number;
  messagesThisWeek: number;
}

export class GroupChatStatsDto {
  totalGroups: number;
  activeGroups: number;
  averageGroupSize: number;
  groupMessagesToday: number;
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

export class GroupChatActivityDto {
  labels: string[];
  activeGroups: number[];
  messagesPerGroup: number[];
}

export class PerformanceMetricsDto {
  labels: string[];
  responseTime: number[];
  uptime: number[];
}

export class ChartDataDto {
  userGrowth: UserGrowthDto;
  messageActivity: MessageActivityDto;
  groupChatActivity: GroupChatActivityDto;
  performanceMetrics: PerformanceMetricsDto;
}

export class DashboardResponseDto {
  userStats: UserStatsDto;
  messageStats: MessageStatsDto;
  groupChatStats: GroupChatStatsDto;
  chartData: ChartDataDto;
  lastUpdated: Date;
}

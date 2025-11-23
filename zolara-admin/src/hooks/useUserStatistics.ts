import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface UserRankingData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  messagesSent: number;
  callsInitiated: number;
  activeTime: number;
  friendsCount: number;
  joinedDate: string;
  lastActive: string;
  engagementScore: number;
}

interface UserStatsData {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
}

interface UserStatisticsData {
  userStats: UserStatsData;
  topUsers: {
    byMessages: UserRankingData[];
    byCalls: UserRankingData[];
    byActiveTime: UserRankingData[];
    byEngagement: UserRankingData[];
  };
  engagementMetrics: {
    averageSessionTime: number;
    averageMessagesPerUser: number;
    averageCallsPerUser: number;
    mostActiveHour: number;
  };
  isLoading: boolean;
}

export const useUserStatistics = () => {
  const [data, setData] = useState<UserStatisticsData>({
    userStats: {
      totalUsers: 0,
      activeUsers: 0,
      newUsersToday: 0,
      newUsersThisWeek: 0,
    },
    topUsers: {
      byMessages: [],
      byCalls: [],
      byActiveTime: [],
      byEngagement: []
    },
    engagementMetrics: {
      averageSessionTime: 0,
      averageMessagesPerUser: 0,
      averageCallsPerUser: 0,
      mostActiveHour: 0,
    },
    isLoading: true,
  });

  useEffect(() => {
    const fetchUserStatistics = async () => {
      try {
        const response = await apiService.getUserStatistics();
        const result = response.data;
        
        setData({
          ...result,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to fetch user statistics:', error);
        // Keep loading false and use empty data
        setData(prevData => ({
          ...prevData,
          isLoading: false,
        }));
      }
    };

    fetchUserStatistics();

    // Optional: Set up polling for real-time updates every 60 seconds
    const interval = setInterval(fetchUserStatistics, 60000);

    return () => clearInterval(interval);
  }, []);

  return data;
};

export type { UserStatisticsData, UserRankingData, UserStatsData };
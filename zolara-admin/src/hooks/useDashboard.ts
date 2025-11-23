import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
}

interface MessageStats {
  totalMessages: number;
  messagesToday: number;
  messagesThisWeek: number;
}

interface GroupChatStats {
  totalGroups: number;
  activeGroups: number;
  averageGroupSize: number;
  groupMessagesToday: number;
}

interface ChartData {
  userGrowth: {
    labels: string[];
    newUsers: number[];
    activeUsers: number[];
  };
  messageActivity: {
    labels: string[];
    messages: number[];
    groupMessages: number[];
  };
  groupChatActivity: {
    labels: string[];
    activeGroups: number[];
    messagesPerGroup: number[];
  };
  performanceMetrics: {
    labels: string[];
    responseTime: number[];
    uptime: number[];
  };
}

interface DashboardData {
  userStats: UserStats;
  messageStats: MessageStats;
  groupChatStats: GroupChatStats;
  chartData: ChartData;
  lastUpdated: Date;
  isLoading: boolean;
}

// Generate mock data
const generateMockData = (): Omit<DashboardData, 'isLoading'> => {
  // Generate last 7 days labels
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
  };

  // Generate last 12 months labels
  const getLast12Months = () => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    }
    return months;
  };

  return {
    userStats: {
      totalUsers: 12543,
      activeUsers: 3421,
      newUsersToday: 127,
      newUsersThisWeek: 834,
    },
    messageStats: {
      totalMessages: 45621,
      messagesToday: 2341,
      messagesThisWeek: 15432,
    },
    groupChatStats: {
      totalGroups: 234,
      activeGroups: 45,
      averageGroupSize: 8,
      groupMessagesToday: 1250,
    },
    chartData: {
      userGrowth: {
        labels: getLast12Months(),
        newUsers: [320, 450, 580, 620, 710, 890, 950, 1020, 1150, 1280, 1350, 1420],
        activeUsers: [2100, 2350, 2580, 2720, 2890, 3120, 3280, 3450, 3620, 3780, 3920, 4050],
      },
      messageActivity: {
        labels: getLast7Days(),
        messages: [1850, 2120, 1980, 2340, 2180, 2450, 2341],
        groupMessages: [450, 520, 480, 590, 540, 610, 580],
      },
      groupChatActivity: {
        labels: getLast7Days(),
        activeGroups: [32, 38, 35, 42, 39, 45, 44],
        messagesPerGroup: [15, 18, 16, 22, 19, 24, 21],
      },
      performanceMetrics: {
        labels: getLast7Days(),
        responseTime: [125, 132, 118, 145, 128, 135, 122],
        uptime: [99.95, 99.98, 99.92, 99.97, 99.99, 99.96, 99.98],
      },
    },
    lastUpdated: new Date(),
  };
};

export const useDashboard = (): DashboardData => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Omit<DashboardData, 'isLoading'>>(generateMockData());

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      try {
        const response = await apiService.getDashboardStats();
        const result = response.data;
        
        setData({
          userStats: result.userStats,
          messageStats: result.messageStats,
          groupChatStats: result.groupChatStats,
          chartData: result.chartData,
          lastUpdated: new Date(result.lastUpdated),
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        // Keep using existing data (mock or previously fetched)
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Optional: Set up polling for real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...data,
    isLoading,
  };
};

export type { DashboardData, UserStats, MessageStats, GroupChatStats, ChartData };

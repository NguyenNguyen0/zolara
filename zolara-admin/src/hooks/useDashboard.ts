import { useState, useEffect } from 'react';

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

interface CallStats {
  totalCalls: number;
  activeCalls: number;
  averageCallDuration: number;
  currentSessionStats?: {
    userCount: number;
    duration: number;
    receiveBitrate: number;
  };
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
  callDistribution: {
    voiceCalls: number;
    videoCalls: number;
    groupCalls: number;
    conferenceCalls: number;
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
  callStats: CallStats;
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
    callStats: {
      totalCalls: 2341,
      activeCalls: 12,
      averageCallDuration: 480, // in seconds
      currentSessionStats: {
        userCount: 5,
        duration: 1200,
        receiveBitrate: 250000,
      },
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
      callDistribution: {
        voiceCalls: 45,
        videoCalls: 30,
        groupCalls: 15,
        conferenceCalls: 10,
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
  const [data] = useState(generateMockData());

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // In a real application, you would fetch data from an API here
  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await fetch('/api/dashboard');
  //       const result = await response.json();
  //       setData(result);
  //     } catch (error) {
  //       console.error('Failed to fetch dashboard data:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //
  //   fetchDashboardData();
  //
  //   // Optional: Set up polling for real-time updates
  //   const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
  //
  //   return () => clearInterval(interval);
  // }, []);

  return {
    ...data,
    isLoading,
  };
};

export type { DashboardData, UserStats, MessageStats, CallStats, ChartData };

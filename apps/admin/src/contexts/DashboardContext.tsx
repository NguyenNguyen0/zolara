import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { agoraService } from '../services/agora';

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

interface AgoraStats {
  activeChannels: number;
  totalChannels: number;
  averageCallDuration: number;
  currentSessionStats?: {
    duration: number;
    userCount: number;
    receiveBitrate: number;
    sendBitrate: number;
    outgoingAvailableBandwidth: number;
  };
}

interface DashboardContextType {
  userStats: UserStats;
  messageStats: MessageStats;
  agoraStats: AgoraStats;
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
  });

  const [messageStats, setMessageStats] = useState<MessageStats>({
    totalMessages: 0,
    messagesToday: 0,
    messagesThisWeek: 0,
  });

  const [agoraStats, setAgoraStats] = useState<AgoraStats>({
    activeChannels: 0,
    totalChannels: 0,
    averageCallDuration: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStats = async (): Promise<UserStats> => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      let activeUsers = 0;
      let newUsersToday = 0;
      let newUsersThisWeek = 0;

      usersSnapshot.forEach((doc) => {
        const data = doc.data();

        // Check if user is active (online)
        if (data.status === 'online' || data.isOnline) {
          activeUsers++;
        }

        // Check creation date
        if (data.createdAt) {
          const createdAt = data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(data.createdAt);

          if (createdAt >= todayStart) {
            newUsersToday++;
          }
          if (createdAt >= weekStart) {
            newUsersThisWeek++;
          }
        }
      });

      return {
        totalUsers: usersSnapshot.size,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
      };
    } catch (err: unknown) {
      console.error('Error fetching user stats:', err);
      throw new Error('Failed to fetch user statistics');
    }
  };

  const fetchMessageStats = async (): Promise<MessageStats> => {
    try {
      const messagesRef = collection(db, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      let messagesToday = 0;
      let messagesThisWeek = 0;

      messagesSnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.createdAt) {
          const createdAt = data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(data.createdAt);

          if (createdAt >= todayStart) {
            messagesToday++;
          }
          if (createdAt >= weekStart) {
            messagesThisWeek++;
          }
        }
      });

      return {
        totalMessages: messagesSnapshot.size,
        messagesToday,
        messagesThisWeek,
      };
    } catch (err: unknown) {
      console.error('Error fetching message stats:', err);
      throw new Error('Failed to fetch message statistics');
    }
  };

  const fetchAgoraStats = async (): Promise<AgoraStats> => {
    try {
      // Get channel data from Firestore if you're storing it
      const channelsRef = collection(db, 'channels');
      const channelsSnapshot = await getDocs(channelsRef);

      let activeChannels = 0;
      let totalDuration = 0;
      let channelCount = 0;

      channelsSnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.status === 'active' || data.isActive) {
          activeChannels++;
        }

        if (data.duration) {
          totalDuration += data.duration;
          channelCount++;
        }
      });

      const averageCallDuration = channelCount > 0 ? totalDuration / channelCount : 0;

      // Try to get current session stats if a client is connected
      let currentSessionStats;
      try {
        const client = agoraService.getClient();
        if (client && client.connectionState === 'CONNECTED') {
          const stats = await agoraService.getChannelStats();
          currentSessionStats = stats;
        }
      } catch (err) {
        console.log('No active Agora session or failed to get stats:', err);
      }

      return {
        activeChannels,
        totalChannels: channelsSnapshot.size,
        averageCallDuration,
        currentSessionStats,
      };
    } catch (err: unknown) {
      console.error('Error fetching Agora stats:', err);
      throw new Error('Failed to fetch Agora statistics');
    }
  };

  const refreshStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [userStatsData, messageStatsData, agoraStatsData] = await Promise.all([
        fetchUserStats(),
        fetchMessageStats(),
        fetchAgoraStats(),
      ]);

      setUserStats(userStatsData);
      setMessageStats(messageStatsData);
      setAgoraStats(agoraStatsData);
      setLastUpdated(new Date());

      console.log('Stats refreshed successfully');
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error refreshing stats:', err);
      setError(error.message || 'Failed to refresh statistics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: DashboardContextType = {
    userStats,
    messageStats,
    agoraStats,
    isLoading,
    lastUpdated,
    error,
    refreshStats,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

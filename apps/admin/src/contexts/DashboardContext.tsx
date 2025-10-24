import React, { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  calculateUserStats,
  calculateMessageStats,
  calculateCallStats,
  mockApiDelay,
  type UserStats,
  type MessageStats,
  type CallStats
} from '../services/mockData';
import { DashboardContext, type DashboardContextType } from './DashboardContextType';

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

  const [callStats, setCallStats] = useState<CallStats>({
    activeCalls: 0,
    totalCalls: 0,
    averageCallDuration: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await mockApiDelay(1000);

      // Get mock statistics
      const userStatsData = calculateUserStats();
      const messageStatsData = calculateMessageStats();
      const callStatsData = calculateCallStats();

      setUserStats(userStatsData);
      setMessageStats(messageStatsData);
      setCallStats(callStatsData);
      setLastUpdated(new Date());

      console.log('Stats refreshed successfully with mock data');
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
    callStats,
    isLoading,
    lastUpdated,
    error,
    refreshStats,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

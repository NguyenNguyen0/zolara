import { createContext } from 'react';
import type { UserStats, MessageStats, CallStats } from '../services/mockData';

export interface DashboardContextType {
  userStats: UserStats;
  messageStats: MessageStats;
  callStats: CallStats;
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

import { createContext } from 'react';
import type { UserStats, MessageStats, CallStats, ChartData } from '../services/mockData';

export interface DashboardContextType {
  userStats: UserStats;
  messageStats: MessageStats;
  callStats: CallStats;
  chartData: ChartData;
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

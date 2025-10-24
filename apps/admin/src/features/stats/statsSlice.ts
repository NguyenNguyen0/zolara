import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { agoraService } from '../../services/agora';

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
}

export interface AgoraStats {
  totalChannels: number;
  activeChannels: number;
  totalCallDuration: number;
  averageCallDuration: number;
  currentSessionStats?: {
    duration: number;
    userCount: number;
    receiveBitrate: number;
    sendBitrate: number;
    outgoingAvailableBandwidth: number;
  };
}

export interface MessageStats {
  totalMessages: number;
  messagesThisWeek: number;
  messagesToday: number;
  averageMessagesPerUser: number;
}

export interface StatsState {
  userStats: UserStats;
  agoraStats: AgoraStats;
  messageStats: MessageStats;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: StatsState = {
  userStats: {
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
  },
  agoraStats: {
    totalChannels: 0,
    activeChannels: 0,
    totalCallDuration: 0,
    averageCallDuration: 0,
  },
  messageStats: {
    totalMessages: 0,
    messagesThisWeek: 0,
    messagesToday: 0,
    averageMessagesPerUser: 0,
  },
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk for fetching user statistics from Firebase
export const fetchUserStats = createAsyncThunk(
  'stats/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const usersRef = collection(db, 'users');

      // Get total users
      const totalUsersSnapshot = await getDocs(usersRef);
      const totalUsers = totalUsersSnapshot.size;

      // Get active users (online status = true)
      const activeUsersQuery = query(usersRef, where('isOnline', '==', true));
      const activeUsersSnapshot = await getDocs(activeUsersQuery);
      const activeUsers = activeUsersSnapshot.size;

      // Get new users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersTodayQuery = query(
        usersRef,
        where('createdAt', '>=', today),
        orderBy('createdAt', 'desc')
      );
      const newUsersTodaySnapshot = await getDocs(newUsersTodayQuery);
      const newUsersToday = newUsersTodaySnapshot.size;

      // Get new users this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);
      const newUsersWeekQuery = query(
        usersRef,
        where('createdAt', '>=', weekStart),
        orderBy('createdAt', 'desc')
      );
      const newUsersWeekSnapshot = await getDocs(newUsersWeekQuery);
      const newUsersThisWeek = newUsersWeekSnapshot.size;

      return {
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user stats';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for fetching message statistics from Firebase
export const fetchMessageStats = createAsyncThunk(
  'stats/fetchMessageStats',
  async (_, { rejectWithValue }) => {
    try {
      const messagesRef = collection(db, 'messages');

      // Get total messages
      const totalMessagesSnapshot = await getDocs(messagesRef);
      const totalMessages = totalMessagesSnapshot.size;

      // Get messages today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const messagesTodayQuery = query(
        messagesRef,
        where('createdAt', '>=', today),
        orderBy('createdAt', 'desc')
      );
      const messagesTodaySnapshot = await getDocs(messagesTodayQuery);
      const messagesToday = messagesTodaySnapshot.size;

      // Get messages this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);
      const messagesWeekQuery = query(
        messagesRef,
        where('createdAt', '>=', weekStart),
        orderBy('createdAt', 'desc')
      );
      const messagesWeekSnapshot = await getDocs(messagesWeekQuery);
      const messagesThisWeek = messagesWeekSnapshot.size;

      // Calculate average messages per user (rough estimate)
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      const averageMessagesPerUser = totalUsers > 0 ? Math.round(totalMessages / totalUsers) : 0;

      return {
        totalMessages,
        messagesThisWeek,
        messagesToday,
        averageMessagesPerUser,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch message stats';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for fetching Agora channel statistics
export const fetchAgoraStats = createAsyncThunk(
  'stats/fetchAgoraStats',
  async (_, { rejectWithValue }) => {
    try {
      // Get channel statistics from Firebase (stored channel data)
      const channelsRef = collection(db, 'channels');
      const channelsSnapshot = await getDocs(channelsRef);
      const totalChannels = channelsSnapshot.size;

      // Get active channels
      const activeChannelsQuery = query(channelsRef, where('isActive', '==', true));
      const activeChannelsSnapshot = await getDocs(activeChannelsQuery);
      const activeChannels = activeChannelsSnapshot.size;

      // Calculate total call duration from stored data
      let totalCallDuration = 0;
      let callCount = 0;

      const callsRef = collection(db, 'calls');
      const callsSnapshot = await getDocs(callsRef);

      callsSnapshot.forEach((doc) => {
        const callData = doc.data();
        if (callData.duration) {
          totalCallDuration += callData.duration;
          callCount++;
        }
      });

      const averageCallDuration = callCount > 0 ? Math.round(totalCallDuration / callCount) : 0;

      // Try to get current session stats if available
      let currentSessionStats;
      try {
        currentSessionStats = await agoraService.getChannelStats();
      } catch {
        // No active session, which is fine
        console.log('No active Agora session for stats');
      }

      return {
        totalChannels,
        activeChannels,
        totalCallDuration,
        averageCallDuration,
        currentSessionStats,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Agora stats';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for fetching all stats
export const fetchAllStats = createAsyncThunk(
  'stats/fetchAllStats',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchUserStats()),
      dispatch(fetchMessageStats()),
      dispatch(fetchAgoraStats()),
    ]);
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLastUpdated: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user stats cases
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch message stats cases
      .addCase(fetchMessageStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessageStats.fulfilled, (state, action) => {
        state.messageStats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchMessageStats.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch Agora stats cases
      .addCase(fetchAgoraStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAgoraStats.fulfilled, (state, action) => {
        state.agoraStats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAgoraStats.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch all stats cases
      .addCase(fetchAllStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllStats.fulfilled, (state) => {
        state.isLoading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAllStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateLastUpdated } = statsSlice.actions;

// Selectors
export const selectStats = (state: { stats: StatsState }) => state.stats;
export const selectUserStats = (state: { stats: StatsState }) => state.stats.userStats;
export const selectAgoraStats = (state: { stats: StatsState }) => state.stats.agoraStats;
export const selectMessageStats = (state: { stats: StatsState }) => state.stats.messageStats;
export const selectStatsLoading = (state: { stats: StatsState }) => state.stats.isLoading;
export const selectStatsError = (state: { stats: StatsState }) => state.stats.error;
export const selectLastUpdated = (state: { stats: StatsState }) => state.stats.lastUpdated;

export default statsSlice.reducer;

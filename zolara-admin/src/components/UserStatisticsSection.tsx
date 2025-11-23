import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  MessageCircle, 
  Phone, 
  Clock, 
  Trophy,
  Star,
  Crown,
  Target,
  Award,
  Activity,
  Calendar,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';
import { useUserStatistics } from '../hooks/useUserStatistics';

interface UserStatisticsProps {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
  };
  isLoading: boolean;
}

interface UserRankingData {
  id: string;
  name: string;
  avatar: string;
  email: string;
  messagesSent: number;
  callsInitiated: number;
  activeTime: number; // in hours
  friendsCount: number;
  joinedDate: string;
  lastActive: string;
  engagementScore: number;
}

// Mock user ranking data
const mockUserRankings: UserRankingData[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: '/api/placeholder/150/150',
    email: 'sarah.johnson@example.com',
    messagesSent: 2543,
    callsInitiated: 187,
    activeTime: 245,
    friendsCount: 89,
    joinedDate: '2024-01-15',
    lastActive: '2 minutes ago',
    engagementScore: 98
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: '/api/placeholder/150/150',
    email: 'michael.chen@example.com',
    messagesSent: 2198,
    callsInitiated: 156,
    activeTime: 198,
    friendsCount: 76,
    joinedDate: '2024-02-03',
    lastActive: '15 minutes ago',
    engagementScore: 94
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    avatar: '/api/placeholder/150/150',
    email: 'emily.rodriguez@example.com',
    messagesSent: 1987,
    callsInitiated: 134,
    activeTime: 167,
    friendsCount: 65,
    joinedDate: '2024-01-28',
    lastActive: '1 hour ago',
    engagementScore: 91
  },
  {
    id: '4',
    name: 'David Thompson',
    avatar: '/api/placeholder/150/150',
    email: 'david.thompson@example.com',
    messagesSent: 1756,
    callsInitiated: 142,
    activeTime: 156,
    friendsCount: 58,
    joinedDate: '2024-03-12',
    lastActive: '3 hours ago',
    engagementScore: 88
  },
  {
    id: '5',
    name: 'Lisa Wang',
    avatar: '/api/placeholder/150/150',
    email: 'lisa.wang@example.com',
    messagesSent: 1634,
    callsInitiated: 98,
    activeTime: 134,
    friendsCount: 72,
    joinedDate: '2024-02-18',
    lastActive: '1 day ago',
    engagementScore: 85
  }
];

type RankingCriteria = 'messages' | 'calls' | 'activeTime' | 'friends' | 'engagement';

const UserStatisticsSection: React.FC<UserStatisticsProps> = ({ userStats: propUserStats, isLoading: propIsLoading }) => {
  const [selectedCriteria, setSelectedCriteria] = useState<RankingCriteria>('engagement');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use enhanced user statistics hook
  const enhancedStats = useUserStatistics();
  
  // Use enhanced data if available, fallback to props
  const userStats = enhancedStats.userStats.totalUsers > 0 ? enhancedStats.userStats : propUserStats;
  const isLoading = enhancedStats.isLoading || propIsLoading;
  const topUsers = enhancedStats.topUsers;

  const getRankingIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCriteriaValue = (user: UserRankingData, criteria: RankingCriteria) => {
    switch (criteria) {
      case 'messages':
        return user.messagesSent;
      case 'calls':
        return user.callsInitiated;
      case 'activeTime':
        return user.activeTime;
      case 'friends':
        return user.friendsCount;
      case 'engagement':
        return user.engagementScore;
      default:
        return 0;
    }
  };

  const getCriteriaLabel = (criteria: RankingCriteria) => {
    switch (criteria) {
      case 'messages':
        return 'Messages Sent';
      case 'calls':
        return 'Calls Initiated';
      case 'activeTime':
        return 'Active Hours';
      case 'friends':
        return 'Friends';
      case 'engagement':
        return 'Engagement Score';
      default:
        return '';
    }
  };

  // Use enhanced data if available, fallback to mock data
  const usersData = topUsers.byEngagement.length > 0 
    ? [...topUsers.byMessages, ...topUsers.byCalls, ...topUsers.byActiveTime, ...topUsers.byEngagement]
      .filter((user, index, self) => index === self.findIndex(u => u.id === user.id)) // Remove duplicates
    : mockUserRankings;

  const sortedUsers = usersData
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => getCriteriaValue(b, selectedCriteria) - getCriteriaValue(a, selectedCriteria));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-primary">User Statistics</h2>
          </div>
          <p className="text-sm text-gray-600 font-medium ml-13">Detailed user metrics and rankings</p>
          <div className="w-24 h-1.5 bg-primary rounded-full mt-3 ml-13 shadow-md"></div>
        </div>
      </div>

      {/* User Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-blue-900">{userStats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+12.5%</span>
            <span className="text-gray-500 ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Users</p>
              <p className="text-2xl font-bold text-green-900">{userStats.activeUsers.toLocaleString()}</p>
            </div>
            <div className="bg-green-200 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+8.2%</span>
            <span className="text-gray-500 ml-1">vs yesterday</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">New Today</p>
              <p className="text-2xl font-bold text-purple-900">{userStats.newUsersToday}</p>
            </div>
            <div className="bg-purple-200 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+15.3%</span>
            <span className="text-gray-500 ml-1">vs avg daily</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">This Week</p>
              <p className="text-2xl font-bold text-orange-900">{userStats.newUsersThisWeek}</p>
            </div>
            <div className="bg-orange-200 p-3 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+22.1%</span>
            <span className="text-gray-500 ml-1">vs last week</span>
          </div>
        </div>
      </div>

      {/* User Rankings Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">User Rankings</h2>
              <p className="text-gray-600 text-sm">Top performers based on various criteria</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Filter by Criteria */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                    title='Criteria'
                  value={selectedCriteria}
                  onChange={(e) => setSelectedCriteria(e.target.value as RankingCriteria)}
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white"
                >
                  <option value="engagement">Engagement Score</option>
                  <option value="messages">Messages Sent</option>
                  <option value="calls">Calls Initiated</option>
                  <option value="activeTime">Active Time</option>
                  <option value="friends">Friends Count</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {sortedUsers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border-2 border-gray-200">
                    {getRankingIcon(index + 1)}
                    {index > 2 && (
                      <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">Last active: {user.lastActive}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {getCriteriaValue(user, selectedCriteria).toLocaleString()}
                      {selectedCriteria === 'activeTime' && ' hrs'}
                      {selectedCriteria === 'engagement' && '/100'}
                    </p>
                    <p className="text-xs text-gray-500">{getCriteriaLabel(selectedCriteria)}</p>
                  </div>

                  <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{user.messagesSent}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{user.callsInitiated}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{user.activeTime}h</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{user.friendsCount}</span>
                    </div>
                  </div>

                  <button title='next-button' className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {sortedUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Engagement Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-indigo-900">Top Communicators</h3>
            <MessageCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="space-y-3">
            {sortedUsers.slice(0, 3).map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-900">{user.name}</p>
                  <p className="text-xs text-indigo-600">{user.messagesSent} messages</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-emerald-900">Call Champions</h3>
            <Phone className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="space-y-3">
            {[...sortedUsers].sort((a, b) => b.callsInitiated - a.callsInitiated).slice(0, 3).map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-900">{user.name}</p>
                  <p className="text-xs text-emerald-600">{user.callsInitiated} calls</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-amber-900">Most Active</h3>
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="space-y-3">
            {[...sortedUsers].sort((a, b) => b.activeTime - a.activeTime).slice(0, 3).map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">{user.name}</p>
                  <p className="text-xs text-amber-600">{user.activeTime} hours</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatisticsSection;
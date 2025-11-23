import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Users, MessageSquare, Users as GroupIcon } from 'lucide-react';
import { SkeletonWrapper, StatCardSkeleton, DetailedStatCardSkeleton } from './ui/Skeleton';

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

interface OverviewSectionProps {
  userStats: UserStats;
  messageStats: MessageStats;
  groupChatStats: GroupChatStats;
  lastUpdated?: Date;
  isLoading?: boolean;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  userStats,
  messageStats,
  groupChatStats,
  lastUpdated,
  isLoading = false
}) => {
  const formatLastUpdated = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;

    return date.toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Overview</h2>
            <div className="w-12 h-1 bg-primary rounded-full mt-1"></div>
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {formatLastUpdated(lastUpdated)}
            </p>
          )}
        </div>

        {isLoading ? (
          <SkeletonWrapper>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <DetailedStatCardSkeleton />
            </div>
          </SkeletonWrapper>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* User Stats */}
            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {userStats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {userStats.activeUsers} currently active
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Users Today
              </CardTitle>
              <Users className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">
                {userStats.newUsersToday}
              </div>
              <p className="text-xs text-muted-foreground">
                {userStats.newUsersThisWeek} this week
              </p>
            </CardContent>
          </Card>

          {/* Message Stats */}
          <Card className="border-l-4 border-l-chart-3 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Messages
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">
                {messageStats.totalMessages.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {messageStats.messagesToday} today
              </p>
            </CardContent>
          </Card>

          {/* Group Chat Stats */}
          <Card className="border-l-4 border-l-chart-4 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Groups
              </CardTitle>
              <GroupIcon className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">
                {groupChatStats.activeGroups}
              </div>
              <p className="text-xs text-muted-foreground">
                {groupChatStats.totalGroups} total groups
              </p>
            </CardContent>
          </Card>
        </div>
        )}
      </div>

      {/* Detailed Stats */}
      {isLoading ? (
        <SkeletonWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DetailedStatCardSkeleton />
            <DetailedStatCardSkeleton />
          </div>
        </SkeletonWrapper>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="text-primary flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Activity
            </CardTitle>
            <CardDescription>
              User registration and activity metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                <span className="text-sm font-medium text-primary">
                  Total Registered Users
                </span>
                <span className="text-sm font-bold text-primary">
                  {userStats.totalUsers.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-chart-2/10 rounded-lg">
                <span className="text-sm font-medium text-chart-2">
                  Currently Active
                </span>
                <span className="text-sm font-bold text-chart-2">
                  {userStats.activeUsers.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">New Users Today</span>
                <span className="text-sm text-gray-600">
                  {userStats.newUsersToday}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">New Users This Week</span>
                <span className="text-sm text-gray-600">
                  {userStats.newUsersThisWeek}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Stats */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="text-primary flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Communication
            </CardTitle>
            <CardDescription>Messaging and group chat statistics</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3 text-chart-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </h4>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between items-center p-2 bg-chart-3/10 rounded">
                    <span className="text-sm">Total Messages</span>
                    <span className="text-sm font-semibold text-chart-3">
                      {messageStats.totalMessages.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Messages Today</span>
                    <span className="text-sm text-gray-600">
                      {messageStats.messagesToday}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Messages This Week</span>
                    <span className="text-sm text-gray-600">
                      {messageStats.messagesThisWeek}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-3 text-chart-4 flex items-center gap-2">
                  <GroupIcon className="h-4 w-4" />
                  Group Chats
                </h4>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between items-center p-2 bg-chart-4/10 rounded">
                    <span className="text-sm">Total Groups</span>
                    <span className="text-sm font-semibold text-chart-4">
                      {groupChatStats.totalGroups}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Groups</span>
                    <span className="text-sm text-gray-600">
                      {groupChatStats.activeGroups}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Group Size</span>
                    <span className="text-sm text-gray-600">
                      {groupChatStats.averageGroupSize} members
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Group Messages Today</span>
                    <span className="text-sm text-gray-600">
                      {groupChatStats.groupMessagesToday}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  );
};

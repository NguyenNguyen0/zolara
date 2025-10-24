import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { LogOut, Users, MessageSquare, Phone, Activity } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    userStats,
    messageStats,
    callStats,
    isLoading,
    lastUpdated,
    refreshStats
  } = useDashboard();

  // Load stats on mount
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRefreshStats = async () => {
    try {
      await refreshStats();
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleRefreshStats}
                disabled={isLoading}
              >
                <Activity className="w-4 h-4 mr-2" />
                {isLoading ? 'Refreshing...' : 'Refresh Stats'}
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Overview</h2>
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {formatLastUpdated(lastUpdated)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* User Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {userStats.activeUsers} currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.newUsersToday}</div>
                <p className="text-xs text-muted-foreground">
                  {userStats.newUsersThisWeek} this week
                </p>
              </CardContent>
            </Card>

            {/* Message Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{messageStats.totalMessages.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {messageStats.messagesToday} today
                </p>
              </CardContent>
            </Card>

            {/* Call Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{callStats.activeCalls}</div>
                <p className="text-xs text-muted-foreground">
                  {callStats.totalCalls} total calls
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Activity */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>User registration and activity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Registered Users</span>
                  <span className="text-sm text-gray-600">{userStats.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Currently Active</span>
                  <span className="text-sm text-gray-600">{userStats.activeUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">New Users Today</span>
                  <span className="text-sm text-gray-600">{userStats.newUsersToday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">New Users This Week</span>
                  <span className="text-sm text-gray-600">{userStats.newUsersThisWeek}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
              <CardDescription>Messaging and call statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Messages</h4>
                  <div className="space-y-2 pl-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Messages</span>
                      <span className="text-sm text-gray-600">{messageStats.totalMessages.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Messages Today</span>
                      <span className="text-sm text-gray-600">{messageStats.messagesToday}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Messages This Week</span>
                      <span className="text-sm text-gray-600">{messageStats.messagesThisWeek}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Voice/Video Calls</h4>
                  <div className="space-y-2 pl-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Calls</span>
                      <span className="text-sm text-gray-600">{callStats.totalCalls}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Calls</span>
                      <span className="text-sm text-gray-600">{callStats.activeCalls}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Call Duration</span>
                      <span className="text-sm text-gray-600">{Math.round(callStats.averageCallDuration / 60)}m</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Session Stats (if available) */}
        {callStats.currentSessionStats && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Session Statistics</CardTitle>
                <CardDescription>Real-time statistics from active call session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{callStats.currentSessionStats.userCount}</div>
                    <p className="text-sm text-gray-600">Users in Session</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(callStats.currentSessionStats.duration / 60)}m</div>
                    <p className="text-sm text-gray-600">Session Duration</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(callStats.currentSessionStats.receiveBitrate / 1000)}kbps</div>
                    <p className="text-sm text-gray-600">Receive Bitrate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="text-gray-700">Loading statistics...</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;

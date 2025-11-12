import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { AnalyticsService, type AnalyticsData } from '../services/analyticsService';
import { Button } from '../components/ui/Button';
import {
  DashboardSidebar,
  OverviewSection,
  AnalyticsSection,
  FirebaseAnalyticsSection,
  type DashboardSection
} from '../components/dashboard';
import { LogOut, Activity } from 'lucide-react';
import logoSrc from '../assets/logo.png';

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

  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [realtimeData, setRealtimeData] = useState<{
    activeUsers: number;
    currentPageViews: number;
    topActivePages: Array<{ page: string; activeUsers: number }>;
  } | null>(null);

  // Load stats on mount
  useEffect(() => {
    refreshStats();
    loadAnalyticsData();
  }, [refreshStats]);

  const loadAnalyticsData = async () => {
    try {
      const [analytics, realtime] = await Promise.all([
        AnalyticsService.getAnalyticsData(),
        AnalyticsService.getRealtimeData()
      ]);
      setAnalyticsData(analytics);
      setRealtimeData(realtime);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  };

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
      await loadAnalyticsData();
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection
            userStats={userStats}
            messageStats={messageStats}
            callStats={callStats}
            lastUpdated={lastUpdated || undefined}
          />
        );
      case 'analytics':
        return <AnalyticsSection callStats={callStats} />;
      case 'firebase-analytics':
        return (
          <FirebaseAnalyticsSection
            analyticsData={analyticsData}
            realtimeData={realtimeData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src={logoSrc} alt="Zolara Logo" className="h-8 w-auto" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-primary/80">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleRefreshStats}
                disabled={isLoading}
                className="border-primary/20 text-primary hover:bg-primary/5"
              >
                <Activity className="w-4 h-4 mr-2" />
                {isLoading ? 'Refreshing...' : 'Refresh Stats'}
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="hover:bg-primary/5 hover:text-primary">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex">
        <DashboardSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          {renderActiveSection()}
        </main>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="text-gray-700">Loading statistics...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

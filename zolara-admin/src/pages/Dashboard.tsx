import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExitIcon } from '@radix-ui/react-icons';
import { DashboardSidebar, type DashboardSection } from '../components/DashboardSidebar';
import { OverviewSection } from '../components/OverviewSection';
import { AnalyticsSection } from '../components/AnalyticsSection';
import { Button } from '../components/ui/Button';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  
  // Get dashboard data from hook
  const { userStats, messageStats, callStats, lastUpdated, isLoading } = useDashboard();

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserName = () => {
    return user?.name || 'Admin';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-purple-50 flex">
      {/* Sidebar */}
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeSection === "overview"
                    ? "Overview Dashboard"
                    : "Analytics Dashboard"}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {getUserName()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600"
                  title="Logout"
                >
                  <ExitIcon className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-gray-600">Loading dashboard data...</p>
              </div>
            </div>
          ) : activeSection === "overview" ? (
            <OverviewSection
              userStats={userStats}
              messageStats={messageStats}
              callStats={callStats}
              lastUpdated={lastUpdated}
            />
          ) : (
            <AnalyticsSection callStats={callStats} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
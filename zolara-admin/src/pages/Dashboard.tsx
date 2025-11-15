import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar, type DashboardSection } from '../components/DashboardSidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { OverviewSection } from '../components/OverviewSection';
import { AnalyticsSection } from '../components/AnalyticsSection';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
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
    <div className="min-h-screen bg-linear-to-br from-white to-purple-50">
      {/* Sidebar - Fixed Position */}
      <div className="fixed top-0 left-0 h-full z-30">
        <DashboardSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isMinimized={!isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        {/* Navigation - Fixed Position */}
        <DashboardHeader
          activeSection={activeSection}
          userName={getUserName()}
          onLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Dashboard Content - Account for fixed nav */}
        <div className="flex-1 mx-auto py-6 sm:px-6 lg:px-8 w-full mt-16">
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
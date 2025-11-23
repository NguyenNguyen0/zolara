import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DashboardSidebar,
  type DashboardSection,
} from "../components/DashboardSidebar";
import { DashboardHeader } from "../components/DashboardHeader";
import { OverviewSection } from "../components/OverviewSection";
import { AnalyticsSection } from "../components/AnalyticsSection";
import UserStatisticsSection from "../components/UserStatisticsSection";
import UserManagementSection from "../components/UserManagementSection";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useDashboard } from "../hooks/useDashboard";
import { useAuth } from "../hooks/useAuth";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, fetchUserProfile } = useAuth();
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Get dashboard data from hook
  const { userStats, messageStats, groupChatStats, lastUpdated, isLoading } =
    useDashboard();

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Fetch user profile on mount
  useEffect(() => {
    if (isAuthenticated && (user?.id || user?.userId)) {
      fetchUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, user?.userId]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate("/");
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50">
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
          isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* Navigation - Fixed Position */}
        <DashboardHeader
          activeSection={activeSection}
          user={user}
          onLogout={handleLogoutClick}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Dashboard Content - Account for fixed nav */}
        <div className="flex-1 mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full mt-16">
          {activeSection === "overview" ? (
            <OverviewSection
              userStats={userStats}
              messageStats={messageStats}
              groupChatStats={groupChatStats}
              lastUpdated={lastUpdated}
              isLoading={isLoading}
            />
          ) : activeSection === "analytics" ? (
            <AnalyticsSection isLoading={isLoading} />
          ) : activeSection === "user-statistics" ? (
            <UserStatisticsSection
              userStats={userStats}
              isLoading={isLoading}
            />
          ) : activeSection === "user-management" ? (
            <UserManagementSection isLoading={isLoading} />
          ) : null}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will be redirected to the login page."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default Dashboard;

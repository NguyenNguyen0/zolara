import React from "react";
import { ExitIcon, PersonIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/Button";
import type { DashboardSection } from "./DashboardSidebar";
import type { User } from "../contexts/AuthContext.types";

interface DashboardHeaderProps {
  activeSection: DashboardSection;
  user: User | null;
  onLogout: () => void;
  isSidebarOpen: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeSection,
  user,
  onLogout,
  isSidebarOpen,
}) => {
  const displayName = user?.fullName || user?.name || 'Admin';
  const avatarUrl = user?.profilePictureUrl;

  return (
    <nav
      className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100 fixed top-0 right-0 left-0 z-20 transition-all duration-300 ease-in-out"
      style={{ left: isSidebarOpen ? "16rem" : "4rem" }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {activeSection === "overview"
                  ? "Overview Dashboard"
                  : "Analytics Dashboard"}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-purple-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border-2 border-purple-300">
                    <PersonIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">Welcome back</span>
                  <span className="text-sm text-purple-600 font-semibold">{displayName}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-red-500 border-2 border-red-200 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all duration-200"
              title="Logout"
            >
              <ExitIcon className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

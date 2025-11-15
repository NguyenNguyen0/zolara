import React from "react";
import { ExitIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/Button";
import type { DashboardSection } from "./DashboardSidebar";

interface DashboardHeaderProps {
  activeSection: DashboardSection;
  userName: string;
  onLogout: () => void;
  isSidebarOpen: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeSection,
  userName,
  onLogout,
  isSidebarOpen,
}) => {
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
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700 font-medium">
                Welcome,
                <span className="text-purple-600 font-semibold"> {userName}</span>
              </span>
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

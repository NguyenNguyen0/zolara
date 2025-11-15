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
      className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-0 z-20 transition-all duration-300 ease-in-out"
      style={{ left: isSidebarOpen ? "16rem" : "4rem" }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
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
              Welcome,
              <span className="text-primary"> {userName}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-red-400 border-2 border-red-200 hover:text-red-600 hover:border-red-600"
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

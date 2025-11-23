import { cn } from '../lib/utils';
import { Activity, Home, PanelRightOpen, PanelRightClose, Users } from 'lucide-react';

export type DashboardSection = 'overview' | 'analytics' | 'user-statistics';

interface SidebarProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  isMinimized: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    id: 'overview' as DashboardSection,
    label: 'Overview',
    icon: Home,
    description: 'User stats and metrics'
  },
  {
    id: 'analytics' as DashboardSection,
    label: 'Analytics',
    icon: Activity,
    description: 'Charts and trends'
  },
  {
    id: 'user-statistics' as DashboardSection,
    label: 'User Statistics',
    icon: Users,
    description: 'User rankings and detailed stats'
  }
];

export const DashboardSidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  isMinimized,
  onToggle
}) => {
  return (
    <div
      className={cn(
        'bg-white/90 backdrop-blur-md border-r border-purple-200 h-screen overflow-y-auto transition-all duration-300 ease-in-out shadow-xl',
        isMinimized ? 'w-16' : 'w-64'
      )}
    >
      {/* Header with Toggle Button */}
      <div className={cn('p-4 border-b border-purple-100 bg-purple-50 flex items-center', isMinimized ? 'justify-center' : 'justify-between')}>
        {!isMinimized && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shadow-md">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-primary">Dashboard</h3>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all duration-200 hover:scale-110"
          title={isMinimized ? 'Expand Sidebar' : 'Minimize Sidebar'}
        >
          {isMinimized ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelRightOpen className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className={`${isMinimized ? 'p-2' : 'p-4'}`}>
        {!isMinimized && (
          <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">Sections</h3>
        )}

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  'w-full flex items-center rounded-xl text-left transition-all duration-200 transform hover:scale-[1.02]',
                  isMinimized ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                  isActive
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300 shadow-lg'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600 border-2 border-transparent'
                )}
                title={isMinimized ? item.label : undefined}
              >
                <div className={cn(
                  'rounded-lg p-1.5 transition-all duration-200',
                  isActive ? 'bg-primary shadow-md' : 'bg-gray-100'
                )}>
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-white' : 'text-gray-500'
                    )}
                  />
                </div>
                {!isMinimized && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'font-semibold text-sm',
                        isActive ? 'text-purple-700' : 'text-gray-900'
                      )}>
                        {item.label}
                      </div>
                      <div className={cn(
                        'text-xs mt-0.5',
                        isActive ? 'text-purple-600' : 'text-gray-500'
                      )}>
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="flex flex-col gap-1">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Optional: Add section summary or quick stats */}
      {!isMinimized && (
        <div className="px-4 py-4 border-t border-purple-100 mt-8 bg-purple-50 rounded-lg mx-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            <div className="text-xs text-purple-700 uppercase tracking-wide font-bold">
              Quick Info
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
            {activeSection === 'overview' && (
              <p className="pl-3 border-l-2 border-purple-300">View user statistics, activity metrics, and system overview.</p>
            )}
            {activeSection === 'analytics' && (
              <p className="pl-3 border-l-2 border-blue-300">Explore visual charts, trends, and performance analytics.</p>
            )}
            {activeSection === 'user-statistics' && (
              <p className="pl-3 border-l-2 border-green-300">View detailed user statistics, rankings, and engagement metrics.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

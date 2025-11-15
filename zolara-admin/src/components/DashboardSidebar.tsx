import { cn } from '../lib/utils';
import { Activity, Home, PanelRightOpen, PanelRightClose } from 'lucide-react';

export type DashboardSection = 'overview' | 'analytics' | 'firebase-analytics';

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
        'bg-white border-r border-gray-200 h-screen overflow-y-auto transition-all duration-300 ease-in-out',
        isMinimized ? 'w-16' : 'w-64'
      )}
    >
      {/* Header with Toggle Button */}
      <div className={cn('p-4 border-b border-gray-100 flex items-center', isMinimized ? 'justify-center' : 'justify-between')}>
        {!isMinimized && (
          <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
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
                  'w-full flex items-center rounded-lg text-left transition-all duration-200',
                  isMinimized ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                title={isMinimized ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0',
                    isMinimized ? '' : 'mt-0.5',
                    isActive ? 'text-primary' : 'text-gray-400'
                  )}
                />
                {!isMinimized && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'font-medium text-sm',
                        isActive ? 'text-primary' : 'text-gray-900'
                      )}>
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2"></div>
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
        <div className="px-4 py-4 border-t border-gray-100 mt-8">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">
            Quick Info
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            {activeSection === 'overview' && (
              <p>View user statistics, activity metrics, and system overview.</p>
            )}
            {activeSection === 'analytics' && (
              <p>Explore visual charts, trends, and performance analytics.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

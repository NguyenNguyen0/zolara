import { cn } from '../../lib/utils';
import { BarChart3, Activity, Home } from 'lucide-react';

export type DashboardSection = 'overview' | 'analytics' | 'firebase-analytics';

interface SidebarProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
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
    id: 'firebase-analytics' as DashboardSection,
    label: 'Firebase Analytics',
    icon: BarChart3,
    description: 'Real-time insights'
  }
];

export const DashboardSidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Dashboard Sections</h3>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 mt-0.5 flex-shrink-0',
                    isActive ? 'text-primary' : 'text-gray-400'
                  )}
                />
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
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Optional: Add section summary or quick stats */}
      <div className="px-6 py-4 border-t border-gray-100 mt-8">
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
          {activeSection === 'firebase-analytics' && (
            <p>Monitor real-time Firebase analytics and user behavior.</p>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  HomeIcon,
  PersonIcon,
  GearIcon,
  BarChartIcon,
  DashboardIcon,
  PlusIcon,
  Cross2Icon,
  MagnifyingGlassIcon,
  BellIcon,
  ExitIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
  Pencil1Icon,
  TrashIcon,
} from '@radix-ui/react-icons';

interface IconDemoProps {
  className?: string;
}

const IconDemo: React.FC<IconDemoProps> = ({ className }) => {
  const icons = [
    { Icon: HomeIcon, name: 'Home' },
    { Icon: PersonIcon, name: 'Person' },
    { Icon: GearIcon, name: 'Settings' },
    { Icon: BarChartIcon, name: 'Chart' },
    { Icon: DashboardIcon, name: 'Dashboard' },
    { Icon: PlusIcon, name: 'Add' },
    { Icon: Cross2Icon, name: 'Close' },
    { Icon: MagnifyingGlassIcon, name: 'Search' },
    { Icon: BellIcon, name: 'Notifications' },
    { Icon: ExitIcon, name: 'Logout' },
    { Icon: ChevronDownIcon, name: 'Dropdown' },
    { Icon: DotsHorizontalIcon, name: 'Menu' },
    { Icon: Pencil1Icon, name: 'Edit' },
    { Icon: TrashIcon, name: 'Delete' },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <DashboardIcon className="h-5 w-5" />
        Radix UI Icons Demo
      </h2>
      <p className="text-gray-600 mb-6">
        A collection of Radix UI icons used throughout the application.
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {icons.map(({ Icon, name }) => (
          <div 
            key={name}
            className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Icon className="h-6 w-6 text-gray-700 mb-2" />
            <span className="text-xs text-gray-600 text-center">{name}</span>
          </div>
        ))}
      </div>

      {/* Example Usage Section */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Example Usage</h3>
        <div className="space-y-4">
          {/* Navigation Example */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Navigation Menu</h4>
            <div className="flex items-center space-x-6">
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-600 transition-colors">
                <HomeIcon className="h-4 w-4" />
                Home
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-600 transition-colors">
                <PersonIcon className="h-4 w-4" />
                Users
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-600 transition-colors">
                <BarChartIcon className="h-4 w-4" />
                Analytics
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-600 transition-colors">
                <GearIcon className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>

          {/* Action Buttons Example */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Action Buttons</h4>
            <div className="flex items-center space-x-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                <PlusIcon className="h-4 w-4" />
                Add New
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Pencil1Icon className="h-4 w-4" />
                Edit
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Utility Icons Example */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Utility Icons</h4>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button 
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors">
                <ExitIcon className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconDemo;
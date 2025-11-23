import {
  UserGrowthChart,
  MessageActivityChart,
  GroupChatActivityChart,
  PerformanceMetricsChart
} from './ui/Charts';
import { Activity } from 'lucide-react';
import { SkeletonWrapper, ChartSkeleton, DonutChartSkeleton } from './ui/Skeleton';



interface AnalyticsSectionProps {
  isLoading?: boolean;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  isLoading = false
}) => {
  return (
    <div className="space-y-8">
      {/* Charts Section */}
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-primary">Analytics & Trends</h2>
          </div>
          <p className="text-sm text-gray-600 font-medium ml-13">Visual insights and performance metrics</p>
          <div className="w-24 h-1.5 bg-primary rounded-full mt-3 ml-13 shadow-md"></div>
        </div>

        {isLoading ? (
          <SkeletonWrapper>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DonutChartSkeleton />
              <ChartSkeleton />
            </div>
          </SkeletonWrapper>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <UserGrowthChart isLoading={isLoading} />
              <MessageActivityChart isLoading={isLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GroupChatActivityChart isLoading={isLoading} />
              <PerformanceMetricsChart isLoading={isLoading} />
            </div>
          </>
        )}
      </div>


    </div>
  );
};

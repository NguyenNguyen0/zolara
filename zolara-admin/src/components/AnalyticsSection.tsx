import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import {
  UserGrowthChart,
  MessageActivityChart,
  CallDistributionChart,
  PerformanceMetricsChart
} from './ui/Charts';
import { Activity } from 'lucide-react';
import { SkeletonWrapper, ChartSkeleton, DonutChartSkeleton, CurrentSessionSkeleton } from './ui/Skeleton';

interface CallStats {
  currentSessionStats?: {
    userCount: number;
    duration: number;
    receiveBitrate: number;
  };
}

interface AnalyticsSectionProps {
  callStats: CallStats;
  isLoading?: boolean;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  callStats,
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
              <CallDistributionChart isLoading={isLoading} />
              <PerformanceMetricsChart isLoading={isLoading} />
            </div>
          </>
        )}
      </div>

      {/* Current Session Stats (if available) */}
      {isLoading ? (
        <SkeletonWrapper>
          <CurrentSessionSkeleton />
        </SkeletonWrapper>
      ) : (
        callStats.currentSessionStats && (
        <Card>
          <CardHeader>
            <CardTitle>Current Session Statistics</CardTitle>
            <CardDescription>Real-time statistics from active call session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{callStats.currentSessionStats.userCount}</div>
                <p className="text-sm text-gray-600">Users in Session</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(callStats.currentSessionStats.duration / 60)}m</div>
                <p className="text-sm text-gray-600">Session Duration</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(callStats.currentSessionStats.receiveBitrate / 1000)}kbps</div>
                <p className="text-sm text-gray-600">Receive Bitrate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        )
      )}
    </div>
  );
};

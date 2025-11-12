import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import {
  UserGrowthChart,
  MessageActivityChart,
  CallDistributionChart,
  PerformanceMetricsChart
} from '../ui/Charts';
import { Activity } from 'lucide-react';

interface CallStats {
  currentSessionStats?: {
    userCount: number;
    duration: number;
    receiveBitrate: number;
  };
}

interface AnalyticsSectionProps {
  callStats: CallStats;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  callStats
}) => {
  return (
    <div className="space-y-8">
      {/* Charts Section */}
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Analytics & Trends</h2>
          </div>
          <p className="text-sm text-gray-500">Visual insights and performance metrics</p>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-chart-2 rounded-full mt-2"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <UserGrowthChart />
          <MessageActivityChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CallDistributionChart />
          <PerformanceMetricsChart />
        </div>
      </div>

      {/* Current Session Stats (if available) */}
      {callStats.currentSessionStats && (
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
      )}
    </div>
  );
};

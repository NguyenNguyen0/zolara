import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import {
  UserGrowthChart,
  MessageActivityChart,
  CallDistributionChart,
  PerformanceMetricsChart
} from './ui/Charts';
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Analytics & Trends</h2>
          </div>
          <p className="text-sm text-gray-600 font-medium ml-13">Visual insights and performance metrics</p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-full mt-3 ml-13 shadow-md"></div>
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

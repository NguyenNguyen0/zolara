import { AnalyticsDashboard } from '../ui/AnalyticsDashboard';
import type { AnalyticsData } from '../../services/analyticsService';
import firebaseIcon from '../../assets/firebase.svg';

interface RealtimeData {
  activeUsers: number;
  currentPageViews: number;
  topActivePages: Array<{ page: string; activeUsers: number }>;
}

interface FirebaseAnalyticsSectionProps {
  analyticsData: AnalyticsData | null;
  realtimeData: RealtimeData | null;
}

export const FirebaseAnalyticsSection: React.FC<FirebaseAnalyticsSectionProps> = ({
  analyticsData,
  realtimeData
}) => {
  if (!analyticsData || !realtimeData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src={firebaseIcon} alt="Firebase" className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-sm text-gray-500">Firebase Analytics data is not available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <img src={firebaseIcon} alt="Firebase" className="w-4 h-4 brightness-0 invert" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Firebase Analytics</h2>
          </div>
          <p className="text-sm text-gray-500">Real-time analytics and user behavior insights</p>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
        </div>

        <AnalyticsDashboard analyticsData={analyticsData} realtimeData={realtimeData} />
      </div>
    </div>
  );
};

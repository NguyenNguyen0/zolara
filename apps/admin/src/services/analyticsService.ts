import { logEvent } from 'firebase/analytics';
import { analytics } from '../config/firebase';

export interface AnalyticsData {
  totalUsers: number;
  totalSessions: number;
  totalPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
  usersByCountry: Array<{ country: string; users: number }>;
  deviceTypes: Array<{ type: string; percentage: number }>;
}

export class AnalyticsService {
  /**
   * Log custom events to Firebase Analytics
   */
  static logEvent(eventName: string, eventParams?: Record<string, string | number | boolean>): void {
    try {
      if (analytics) {
        logEvent(analytics, eventName, eventParams);
      }
    } catch (error) {
      console.error('Error logging analytics event:', error);
    }
  }

  /**
   * Log admin login event
   */
  static logAdminLogin(method: string = 'email'): void {
    this.logEvent('admin_login', {
      login_method: method,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log admin logout event
   */
  static logAdminLogout(): void {
    this.logEvent('admin_logout', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log dashboard view event
   */
  static logDashboardView(): void {
    this.logEvent('page_view', {
      page_title: 'Admin Dashboard',
      page_location: '/dashboard'
    });
  }

  /**
   * Mock analytics data (replace with real Firebase Analytics reporting when available)
   * In a real implementation, you would use Firebase Analytics Reporting API
   * or Google Analytics Reporting API to fetch this data
   */
  static async getAnalyticsData(): Promise<AnalyticsData> {
    // This is mock data. In a real implementation, you would:
    // 1. Use Firebase Analytics Reporting API
    // 2. Use Google Analytics 4 Reporting API
    // 3. Store custom analytics in Firestore and query it

    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData: AnalyticsData = {
          totalUsers: Math.floor(Math.random() * 1000) + 500,
          totalSessions: Math.floor(Math.random() * 2000) + 1000,
          totalPageViews: Math.floor(Math.random() * 5000) + 2500,
          averageSessionDuration: Math.floor(Math.random() * 300) + 120,
          bounceRate: Math.floor(Math.random() * 30) + 20,
          topPages: [
            { page: '/home', views: Math.floor(Math.random() * 1000) + 500 },
            { page: '/chat', views: Math.floor(Math.random() * 800) + 400 },
            { page: '/profile', views: Math.floor(Math.random() * 600) + 300 },
            { page: '/settings', views: Math.floor(Math.random() * 400) + 200 },
            { page: '/help', views: Math.floor(Math.random() * 300) + 150 }
          ],
          usersByCountry: [
            { country: 'United States', users: Math.floor(Math.random() * 300) + 150 },
            { country: 'United Kingdom', users: Math.floor(Math.random() * 200) + 100 },
            { country: 'Germany', users: Math.floor(Math.random() * 150) + 75 },
            { country: 'France', users: Math.floor(Math.random() * 120) + 60 },
            { country: 'Japan', users: Math.floor(Math.random() * 100) + 50 }
          ],
          deviceTypes: [
            { type: 'Mobile', percentage: Math.floor(Math.random() * 20) + 60 },
            { type: 'Desktop', percentage: Math.floor(Math.random() * 20) + 25 },
            { type: 'Tablet', percentage: Math.floor(Math.random() * 10) + 5 }
          ]
        };

        // Ensure device percentages add up to 100
        const totalPercentage = mockData.deviceTypes.reduce((sum, device) => sum + device.percentage, 0);
        const adjustment = 100 - totalPercentage;
        mockData.deviceTypes[0].percentage += adjustment;

        resolve(mockData);
      }, 500); // Simulate API delay
    });
  }

  /**
   * Get real-time analytics data (mock for now)
   * In production, this would connect to Firebase Analytics real-time reporting
   */
  static async getRealtimeData(): Promise<{
    activeUsers: number;
    currentPageViews: number;
    topActivePages: Array<{ page: string; activeUsers: number }>;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          activeUsers: Math.floor(Math.random() * 50) + 10,
          currentPageViews: Math.floor(Math.random() * 100) + 25,
          topActivePages: [
            { page: '/home', activeUsers: Math.floor(Math.random() * 20) + 5 },
            { page: '/chat', activeUsers: Math.floor(Math.random() * 15) + 3 },
            { page: '/profile', activeUsers: Math.floor(Math.random() * 10) + 2 }
          ]
        });
      }, 300);
    });
  }

  /**
   * Track user engagement events
   */
  static logUserEngagement(action: string, category?: string, value?: number): void {
    this.logEvent('user_engagement', {
      engagement_action: action,
      engagement_category: category || 'general',
      value: value || 1
    });
  }

  /**
   * Track admin actions
   */
  static logAdminAction(action: string, details?: Record<string, string | number | boolean>): void {
    this.logEvent('admin_action', {
      action_type: action,
      timestamp: new Date().toISOString(),
      ...details
    });
  }
}

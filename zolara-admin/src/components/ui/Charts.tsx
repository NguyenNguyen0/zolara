import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { useDashboard } from '../../hooks/useDashboard';
import { SkeletonWrapper, ChartSkeleton, DonutChartSkeleton } from './Skeleton';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// Chart options with consistent styling
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      cornerRadius: 6,
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
};

// User Growth Chart Component
export const UserGrowthChart: React.FC<{ isLoading?: boolean }> = ({ isLoading = false }) => {
  const { chartData, isLoading: hookLoading } = useDashboard();
  
  const loading = isLoading || hookLoading;
  
  if (loading) {
    return (
      <SkeletonWrapper>
        <ChartSkeleton height={320} />
      </SkeletonWrapper>
    );
  }

  const data = {
    labels: chartData.userGrowth.labels,
    datasets: [
      {
        label: 'New Users',
        data: chartData.userGrowth.newUsers,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Active Users',
        data: chartData.userGrowth.activeUsers,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth Trend</CardTitle>
        <CardDescription>Monthly user registration and activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={data} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
};

// Message Activity Chart Component
export const MessageActivityChart: React.FC<{ isLoading?: boolean }> = ({ isLoading = false }) => {
  const { chartData, isLoading: hookLoading } = useDashboard();
  
  const loading = isLoading || hookLoading;
  
  if (loading) {
    return (
      <SkeletonWrapper>
        <ChartSkeleton height={320} />
      </SkeletonWrapper>
    );
  }

  const data = {
    labels: chartData.messageActivity.labels,
    datasets: [
      {
        label: 'Messages Sent',
        data: chartData.messageActivity.messages,
        backgroundColor: '#2563eb',
        borderRadius: 4,
      },
      {
        label: 'Group Messages',
        data: chartData.messageActivity.groupMessages,
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        stacked: true,
      },
      y: {
        ...chartOptions.scales.y,
        stacked: true,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Activity</CardTitle>
        <CardDescription>Daily message volume breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

// Group Chat Activity Chart Component
export const GroupChatActivityChart: React.FC<{ isLoading?: boolean }> = ({ isLoading = false }) => {
  const { chartData, isLoading: hookLoading } = useDashboard();
  
  const loading = isLoading || hookLoading;
  
  if (loading) {
    return (
      <SkeletonWrapper>
        <ChartSkeleton height={320} />
      </SkeletonWrapper>
    );
  }

  const data = {
    labels: chartData.groupChatActivity.labels,
    datasets: [
      {
        label: 'Active Groups',
        data: chartData.groupChatActivity.activeGroups,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Messages per Group',
        data: chartData.groupChatActivity.messagesPerGroup,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Chat Activity</CardTitle>
        <CardDescription>Daily group engagement trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={data} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
};

// Performance Metrics Chart Component
export const PerformanceMetricsChart: React.FC<{ isLoading?: boolean }> = ({ isLoading = false }) => {
  const { chartData, isLoading: hookLoading } = useDashboard();
  
  const loading = isLoading || hookLoading;
  
  if (loading) {
    return (
      <SkeletonWrapper>
        <ChartSkeleton height={320} />
      </SkeletonWrapper>
    );
  }

  const data = {
    labels: chartData.performanceMetrics.labels,
    datasets: [
      {
        label: 'Response Time (ms)',
        data: chartData.performanceMetrics.responseTime,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Uptime (%)',
        data: chartData.performanceMetrics.uptime,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Response Time (ms)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Uptime (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 99,
        max: 100,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>System performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

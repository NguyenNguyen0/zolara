import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent, CardHeader } from './Card';

// Base skeleton theme wrapper
export const SkeletonWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
    {children}
  </SkeletonTheme>
);

// Individual card skeleton for overview stats
export const StatCardSkeleton: React.FC = () => (
  <Card className="border-l-4 border-l-gray-200 hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="space-y-2">
        <Skeleton height={16} width={120} />
      </div>
      <Skeleton circle width={16} height={16} />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton height={32} width={80} />
        <Skeleton height={12} width={100} />
      </div>
    </CardContent>
  </Card>
);

// Detailed overview card skeleton (for call stats with nested data)
export const DetailedStatCardSkeleton: React.FC = () => (
  <Card className="border-l-4 border-l-gray-200 hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="space-y-2">
        <Skeleton height={16} width={100} />
      </div>
      <Skeleton circle width={16} height={16} />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Skeleton height={32} width={60} />
        <Skeleton height={12} width={120} />
        
        {/* Nested stats */}
        <div className="space-y-2 pl-4">
          <div className="p-2 bg-gray-50 rounded">
            <div className="flex justify-between items-center">
              <Skeleton height={12} width={80} />
              <Skeleton height={12} width={40} />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Skeleton height={12} width={90} />
            <Skeleton height={12} width={30} />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton height={12} width={110} />
            <Skeleton height={12} width={35} />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Chart skeleton component
export const ChartSkeleton: React.FC<{ height?: number }> = ({ 
  height = 320 
}) => (
  <Card>
    <CardHeader>
      <div className="space-y-2">
        <Skeleton height={20} width={150} />
        <Skeleton height={14} width={200} />
      </div>
    </CardHeader>
    <CardContent>
      <div style={{ height }} className="flex items-end gap-2 justify-center">
        {/* Simulated bar chart skeleton */}
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton 
              height={Math.random() * (height - 100) + 50} 
              width={30}
            />
            <Skeleton height={12} width={25} />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Donut chart skeleton
export const DonutChartSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="space-y-2">
        <Skeleton height={20} width={150} />
        <Skeleton height={14} width={180} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-80 flex items-center justify-center">
        <Skeleton circle width={200} height={200} />
      </div>
    </CardContent>
  </Card>
);

// Analytics real-time card skeleton
export const RealTimeAnalyticsSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Skeleton circle width={12} height={12} />
        <Skeleton height={20} width={160} />
      </div>
      <Skeleton height={14} width={220} />
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
            <Skeleton height={32} width={60} className="mx-auto mb-2" />
            <Skeleton height={14} width={80} className="mx-auto" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Session overview skeleton for analytics
export const SessionOverviewSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Skeleton circle width={20} height={20} />
        <Skeleton height={20} width={140} />
      </div>
      <Skeleton height={14} width={160} />
    </CardHeader>
    <CardContent className="space-y-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <Skeleton height={14} width={120} />
          <Skeleton height={18} width={80} />
        </div>
      ))}
    </CardContent>
  </Card>
);

// Device analytics skeleton
export const DeviceAnalyticsSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Skeleton circle width={20} height={20} />
        <Skeleton height={20} width={140} />
      </div>
      <Skeleton height={14} width={180} />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Skeleton circle width={16} height={16} />
              <Skeleton height={14} width={80} />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton height={8} width={80} />
              <Skeleton height={14} width={30} />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Top pages/geographic data skeleton
export const TopPagesSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton height={20} width={140} />
      <Skeleton height={14} width={200} />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <Skeleton circle width={24} height={24} />
              <Skeleton height={14} width={120} />
            </div>
            <Skeleton height={14} width={80} />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Current session stats skeleton
export const CurrentSessionSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton height={20} width={200} />
      <Skeleton height={14} width={280} />
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="text-center">
            <Skeleton height={32} width={40} className="mx-auto mb-2" />
            <Skeleton height={14} width={100} className="mx-auto" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
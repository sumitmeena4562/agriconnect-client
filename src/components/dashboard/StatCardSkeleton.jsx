import React from 'react';
import SkeletonBlock from '../ui/SkeletonBlock';

/**
 * StatCardSkeleton — Shimmer placeholder for StatCard while data loads
 * Used in FarmerDashboard stats grid
 */
const StatCardSkeleton = () => (
  <div className="global-card !p-4 flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-6 w-32" />
      </div>
      <SkeletonBlock className="w-8 h-8 rounded-lg shrink-0" />
    </div>
  </div>
);

export default StatCardSkeleton;

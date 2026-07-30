import React from 'react';
import SkeletonBlock from '../ui/SkeletonBlock';

/**
 * OrderCardSkeleton — Shimmer placeholder for pending order rows while data loads
 * Used in FarmerDashboard "Incoming Vendor Orders" feed
 */
const OrderCardSkeleton = () => (
  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
    <div className="space-y-2 flex-1">
      <SkeletonBlock className="h-3.5 w-40" />
      <SkeletonBlock className="h-3 w-56" />
    </div>
    <div className="flex gap-2">
      <SkeletonBlock className="h-8 w-16 rounded-lg" />
      <SkeletonBlock className="h-8 w-16 rounded-lg" />
    </div>
  </div>
);

export default OrderCardSkeleton;

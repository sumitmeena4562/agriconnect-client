import React from 'react';
import SkeletonBlock from '../ui/SkeletonBlock';

/**
 * OrderCardSkeleton — Shimmer placeholder for pending order rows while data loads
 */
export const OrderCardSkeleton = () => (
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

/**
 * OrderGridCardSkeleton — Shimmer placeholder for order grid cards
 */
export const OrderGridCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 space-y-3.5 shadow-xs flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div className="space-y-1.5 flex-1">
        <SkeletonBlock className="h-4 w-28 rounded-md" />
        <SkeletonBlock className="h-3 w-36 rounded-md" />
      </div>
      <SkeletonBlock className="h-5 w-16 rounded-full" />
    </div>
    <div className="space-y-2 py-1">
      <SkeletonBlock className="h-3.5 w-full rounded-md" />
      <SkeletonBlock className="h-3.5 w-3/4 rounded-md" />
    </div>
    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
      <SkeletonBlock className="h-5 w-20 rounded-md" />
      <SkeletonBlock className="h-7 w-24 rounded-lg" />
    </div>
  </div>
);

export default OrderCardSkeleton;

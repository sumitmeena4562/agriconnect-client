import React from 'react';
import SkeletonBlock from '../ui/SkeletonBlock';

const CropCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden flex flex-col border border-slate-200 p-3 space-y-3 shadow-xs">
    <SkeletonBlock className="h-36 w-full rounded-lg" />
    <div className="space-y-2">
      <SkeletonBlock className="h-4 w-3/4 rounded-md" />
      <SkeletonBlock className="h-3 w-1/2 rounded-md" />
    </div>
    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
      <SkeletonBlock className="h-5 w-20 rounded-md" />
      <SkeletonBlock className="h-7 w-16 rounded-md" />
    </div>
  </div>
);

export default CropCardSkeleton;

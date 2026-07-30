import React from 'react';

/**
 * SkeletonBlock — Reusable shimmer placeholder
 * Usage: <SkeletonBlock className="h-4 w-32" />
 */
const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

export default SkeletonBlock;

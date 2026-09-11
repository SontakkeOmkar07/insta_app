import React from 'react';

export const Loader = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex items-center justify-center p-6">
      <div
        className={`${sizes[size]} rounded-full border-neutral-300 dark:border-neutral-700 border-t-sky-500 animate-spin`}
      />
    </div>
  );
};

export const PostSkeleton = () => {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl mb-6 p-4 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="space-y-1.5 flex-1">
          <div className="w-28 h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
          <div className="w-20 h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
        </div>
      </div>
      <div className="w-full aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
      <div className="space-y-2">
        <div className="w-1/3 h-3 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
        <div className="w-2/3 h-3 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
      </div>
    </div>
  );
};
import React from 'react';

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28',
};

const storyRingPadding = {
  xs: 'p-[1.5px]',
  sm: 'p-[2px]',
  md: 'p-[2.5px]',
  lg: 'p-[3px]',
  xl: 'p-[3.5px]',
  '2xl': 'p-[4px]',
};

export const Avatar = ({
  src,
  alt = 'User avatar',
  size = 'md',
  hasStory = false,   
  isStoryViewed = false,
  onClick,
  className = '',
}) => {
  const sizeClass = sizeClasses[size];
  const ringPadding = storyRingPadding[size];

  const ringClass = hasStory
    ? isStoryViewed
      ? 'bg-neutral-300 dark:bg-neutral-700'
      : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600'
    : '';

  return (
    <div
      onClick={onClick}
      className={`relative inline-block shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {hasStory ? (
        <div className={`rounded-full ${ringClass} ${ringPadding} transition-all duration-300`}>
          <div className="rounded-full bg-white dark:bg-neutral-900 p-[1.5px]">
            <img
              src={src || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
              alt={alt}
              className={`${sizeClass} rounded-full object-cover`}
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        <img
          src={src || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
          alt={alt}
          className={`${sizeClass} rounded-full object-cover border border-neutral-200 dark:border-neutral-800`}
          loading="lazy"
        />
      )}
    </div>
  );
};
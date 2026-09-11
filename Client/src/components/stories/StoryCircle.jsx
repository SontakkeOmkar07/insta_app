import React from 'react';
import { Avatar } from '../common/Avatar';

export const StoryCircle = ({
  username,
  avatar,
  isCurrentUser = false,
  hasStory = false,
  isViewed = false,
  onClick,
  onAddStoryClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
      className="flex flex-col items-center gap-1.5 shrink-0 select-none group cursor-pointer"
    >
      <div className="relative">
        <Avatar
          src={avatar}
          size="lg"
          hasStory={hasStory}
          isStoryViewed={isViewed}
          onClick={onClick}
          className="group-hover:scale-105 transition-transform duration-200"
        />
        {isCurrentUser && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onAddStoryClick) onAddStoryClick();
              else onClick();
            }}
            className="absolute bottom-0 cursor-pointer right-0 w-5 h-5 bg-sky-500 hover:bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-neutral-900 shadow-sm"
            title="Add to story"
          >
            +
          </button>
        )}
      </div>
      <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 max-w-[68px] truncate text-center">
        {isCurrentUser ? 'Your story' : username}
      </span>
    </div>
  );
};

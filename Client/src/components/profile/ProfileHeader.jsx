import React from 'react';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Settings } from 'lucide-react';

export const ProfileHeader = ({
  user,
  postsCount,
  isSelf,
  isFollowing,
  onFollowToggle,
  onEditProfileClick,
  onFollowersClick,
  onFollowingClick,
  onStoryClick,
  hasStory = false,
}) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 pb-8 border-b border-neutral-200 dark:border-neutral-800">
      <div className="shrink-0">
        <Avatar
          src={user.image}
          size="2xl"
          hasStory={hasStory}
          onClick={onStoryClick}
          className="hover:scale-105 transition-transform"
        />
      </div>

      <div className="flex-1 space-y-4 text-center sm:text-left min-w-0 w-full">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-light text-neutral-900 dark:text-neutral-100 font-mono tracking-tight">
            {user.username}
          </h1>

          <div className="flex items-center gap-2.5">
            {isSelf ? (
              <>
                <Button onClick={onEditProfileClick} variant="secondary" size="sm">
                  Edit Profile
                </Button>
                <button
                  onClick={onEditProfileClick}
                  className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  aria-label="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Button
                  onClick={onFollowToggle}
                  variant={isFollowing ? 'secondary' : 'primary'}
                  size="sm"
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="secondary" size="sm">
                  Message
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center sm:justify-start gap-8 text-sm">
          <div>
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              {postsCount}
            </span>{' '}
            <span className="text-neutral-500">posts</span>
          </div>
          <button onClick={onFollowersClick} className="hover:opacity-80">
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              {user.followers?.length || 0}
            </span>{' '}
            <span className="text-neutral-500">followers</span>
          </button>
          <button onClick={onFollowingClick} className="hover:opacity-80">
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              {user.following?.length || 0}
            </span>{' '}
            <span className="text-neutral-500">following</span>
          </button>
        </div>

        <div className="space-y-1 text-xs sm:text-sm">
          {fullName && (
            <div className="font-bold text-neutral-900 dark:text-neutral-100">
              {fullName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const UserCard = ({ user, onClick, showFollowButton = true }) => {
  const { currentUser } = useAuth();
  const { toggleFollowUser } = useData();

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const isSelf = currentUser?.clerkId === user.clerkId;
  const isFollowing = currentUser?.following?.includes(user.clerkId) || false;

  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors">
      <div onClick={onClick} className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
        <Avatar src={user.image} size="md" />
        <div className="min-w-0 flex-1">
          <div className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">
            {user.username}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
            {fullName}
          </div>
        </div>
      </div>

      {showFollowButton && !isSelf && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFollowUser(user.clerkId);
          }}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
            isFollowing
              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200'
              : 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
};
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const RightPanel = () => {
  const { currentUser, switchUser } = useAuth();
  const { users, toggleFollowUser } = useData();
  const navigate = useNavigate();

  if (!currentUser) return null;

  // Filter suggested users (not current user and accounts not followed yet or random mix)
  const suggestions = users.filter((u) => u.id !== currentUser.id).slice(0, 5);

  return (
    <div className="hidden lg:block w-80 shrink-0 pt-4 px-2 space-y-6 text-xs">
      {/* Current User Card */}
      <div className="flex items-center justify-between gap-3 p-1">
        <div
          onClick={() => navigate(`/profile/${currentUser.username}`)}
          className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
        >
          <Avatar src={currentUser.profileImage} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-neutral-900 dark:text-neutral-100 text-sm truncate group-hover:text-sky-500 transition-colors">
              {currentUser.username}
            </div>
            <div className="text-neutral-500 dark:text-neutral-400 truncate">
              {currentUser.fullName}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            const next = users.find((u) => u.id !== currentUser.id);
            if (next) switchUser(next);
          }}
          className="text-sky-500 hover:text-sky-600 font-semibold text-xs shrink-0"
        >
          Switch
        </button>
      </div>

      {/* Suggestions Header */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="font-bold text-neutral-500 dark:text-neutral-400">
            Suggested for you
          </span>
          <Link
            to="/search"
            className="font-bold text-neutral-900 dark:text-neutral-200 hover:text-sky-500 text-[11px]"
          >
            See All
          </Link>
        </div>

        {/* Suggested User List */}
        <div className="space-y-3">
          {suggestions.map((u) => {
            const isFollowing = currentUser.following.includes(u.id);

            return (
              <div key={u.id} className="flex items-center justify-between gap-3 p-1">
                <div
                  onClick={() => navigate(`/profile/${u.username}`)}
                  className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                >
                  <Avatar src={u.profileImage} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs truncate group-hover:text-sky-500 transition-colors">
                      {u.username}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate">
                      {isFollowing ? 'Follows you' : 'Popular on Instagram'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollowUser(u.id)}
                  className={`font-semibold text-xs transition-colors shrink-0 ${
                    isFollowing
                      ? 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                      : 'text-sky-500 hover:text-sky-600'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Links */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400 dark:text-neutral-500 space-y-3 leading-relaxed">
        <p className="flex flex-wrap gap-x-2 gap-y-1">
          <span>About</span> • <span>Help</span> • <span>Press</span> • <span>API</span> •{' '}
          <span>Jobs</span> • <span>Privacy</span> • <span>Terms</span> • <span>Locations</span>
        </p>
        <p className="uppercase tracking-wider font-medium text-[10px]">
          © 2026 INSTAGRAM FROM META (FIGMA CLONE)
        </p>
      </div>
    </div>
  );
};
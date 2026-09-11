import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, Compass, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

export const MobileNavbar = ({ onCreatePostClick }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 h-16 pb-[env(safe-area-inset-bottom)] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-3 flex items-center justify-around"
      aria-label="Mobile navigation"
    >
      <NavLink
        to="/"
        className={({ isActive }) =>
          `p-2.5 rounded-xl text-neutral-800 dark:text-neutral-200 transition-transform ${isActive ? 'scale-110 text-neutral-900 dark:text-white' : 'opacity-70'}`
        }
      >
        <Home className={`w-6 h-6 ${location.pathname === '/' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
      </NavLink>

      <NavLink
        to="/stories"
        className={({ isActive }) =>
          `p-2.5 rounded-xl text-neutral-800 dark:text-neutral-200 transition-transform ${isActive ? 'scale-110 text-neutral-900 dark:text-white' : 'opacity-70'}`
        }
      >
        <Sparkles className={`w-6 h-6 text-rose-500 ${location.pathname === '/stories' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
      </NavLink>

      <button
        onClick={onCreatePostClick}
        className="p-2.5 rounded-xl text-neutral-800 dark:text-neutral-200 hover:scale-105 transition-transform"
        aria-label="Create post"
      >
        <PlusSquare className="w-6 h-6 stroke-[1.75]" />
      </button>

      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `p-2.5 rounded-xl text-neutral-800 dark:text-neutral-200 transition-transform ${isActive ? 'scale-110 text-neutral-900 dark:text-white' : 'opacity-70'}`
        }
      >
        <Compass className={`w-6 h-6 ${location.pathname === '/explore' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
      </NavLink>

      <NavLink
        to={currentUser ? `/profile/${currentUser.username}` : '/login'}
        className={({ isActive }) =>
          `p-1.5 ${isActive ? 'ring-2 ring-neutral-900 dark:ring-neutral-100 rounded-full' : ''}`
        }
      >
        {currentUser ? (
          <Avatar src={currentUser.image} size="xs" />
        ) : (
          <UserIcon className="w-6 h-6 text-neutral-800 dark:text-neutral-200" />
        )}
      </NavLink>
    </nav>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, MessageCircle, PlusSquare } from 'lucide-react';
// import { useData } from '../../context/DataContext';
import { BsInstagram } from "react-icons/bs";

export const Header = ({ onCreatePostClick }) => {
  // const { notifications } = useData();
  // const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between">
      <NavLink to="/" className="flex items-center gap-2">
        <BsInstagram className="w-7 h-7 shrink-0 text-neutral-900 dark:text-neutral-100" />

        <span className="text-xl font-bold font-serif bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
          Instagram
        </span>
      </NavLink>

      <div className="flex items-center gap-4">
        <button
          onClick={onCreatePostClick}
          className="p-1 text-neutral-800 dark:text-neutral-200 hover:text-sky-500"
          aria-label="Create Post"
        >
          <PlusSquare className="w-6 h-6 stroke-[1.75]" />
        </button>

        <NavLink
          to="/notifications"
          className="relative p-1 text-neutral-800 dark:text-neutral-200 hover:text-rose-500"
          aria-label="Notifications"
        >
          <Heart className="w-6 h-6 stroke-[1.75]" />
          {/* {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-neutral-900" />
          )} */}
        </NavLink>

        <NavLink
          to="/messages"
          className="p-1 text-neutral-800 dark:text-neutral-200 hover:text-sky-500"
          aria-label="Messages"
        >
          <MessageCircle className="w-6 h-6 stroke-[1.75]" />
        </NavLink>
      </div>
    </header>
  );
};
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Compass,
  MessageCircle,
  Heart,
  PlusSquare,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { BsInstagram } from "react-icons/bs";

import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataCOntext';
import { Avatar } from '../common/Avatar';
import { UserCard } from '../users/UserCard';
import { useClerk } from "@clerk/clerk-react";

const REMEMBERED_ACCOUNTS_KEY = import.meta.env.REMEMBERED_ACCOUNTS_KEY ;

export const Sidebar = ({ onCreatePostClick }) => {
  const { currentUser } = useAuth();
  const { users, messages, notifications = [] } = useData();
  const { signOut } = useClerk();

  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [rememberedAccounts, setRememberedAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(REMEMBERED_ACCOUNTS_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!currentUser?.clerkId) return;

    setRememberedAccounts((accounts) => {
      const account = {
        clerkId: currentUser.clerkId,
        email: currentUser.email,
        username: currentUser.username,
        image: currentUser.image,
      };
      const nextAccounts = [
        account,
        ...accounts.filter((item) => item.clerkId !== account.clerkId),
      ];

      localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(nextAccounts));
      return nextAccounts;
    });
  }, [currentUser]);

  const messageCount =
    messages.filter(
      (message) => message.receiverId === currentUser.clerkId
    ).length

  const unreadNotificationCount = notifications.filter((notification) => !notification.isRead).length;

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsNotifOpen(false);
  };


  const switchAccount = async (account) => {
    if (!account || account.clerkId === currentUser?.clerkId) return;

    if (currentUser) {
      await signOut({ redirectUrl: `/login?account=${encodeURIComponent(account.email)}` });
      return;
    }

    navigate(`/login?account=${encodeURIComponent(account.email)}`);
    setIsMoreMenuOpen(false);
  };

  const filteredSearchUsers = searchQuery.trim()
    ? users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : users.slice(0, 5);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Stories', path: '/stories', icon: Sparkles },
    { label: 'Search', action: toggleSearch, icon: Search },
    { label: 'Explore', path: '/explore', icon: Compass },

    {
      label: 'Messages',
      path: '/messages',
      icon: MessageCircle,
      badge: messageCount,
    },

    {
      label: 'Notifications',
      path: '/notifications',
      icon: Heart,
      badge: unreadNotificationCount,
    },

    { label: 'Create', action: onCreatePostClick, icon: PlusSquare },
    {
      label: 'Profile',
      path: currentUser ? `/profile/${currentUser.username}` : '/login',
      isProfile: true,
    },
  ];
  return (
    <>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30 w-16 xl:w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 p-3 select-none">
        {/* Brand Logo */}
        <div className="pt-6 pb-8 px-3">
          <NavLink to="/" className="flex items-center gap-3">
            <BsInstagram className="w-7 h-7 shrink-0 text-neutral-900 dark:text-neutral-100" />
            <span className="hidden xl:inline text-xl font-bold font-serif tracking-tight bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
              Instagram
            </span>
          </NavLink>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item, idx) => {

            const Icon = item.icon;
            const isActive = item.path ? location.pathname === item.path : item.activeState;

            if (item.action) {
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${isActive
                    ? 'font-bold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                    }`}
                >
                  <div className="relative">

                    {Icon && <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />}
                    {item.badge && typeof item.badge === 'number' && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="hidden xl:inline text-sm">{item.label}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={idx}
                to={item.path}
                onClick={() => {
                  setIsSearchOpen(false);
                  setIsNotifOpen(false);
                }}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${isActive
                    ? 'font-bold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`
                }
              >
                <div className="relative shrink-0">
                  {item.isProfile && currentUser ? (
                    <Avatar src={currentUser.image} size="xs" />
                  ) : (
                    Icon && <Icon className={`w-6 h-6 ${location.pathname === item.path ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  )}
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden xl:inline text-sm flex-1">{item.label}</span>
                {'badge' in item && typeof item.badge === 'string' && (
                  <span className="hidden xl:inline text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* More Menu Dropdown */}
        <div className="relative pt-2">
          {isMoreMenuOpen && (
            <div className="absolute bottom-14 left-0 w-60 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl p-2 space-y-1 z-50 animate-in fade-in duration-150">
              <div className="p-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Switch Accounts
              </div>
              {rememberedAccounts.map((user) => {


                const isCurrentUser = currentUser.clerkId === user.clerkId;

                return (


                  <button
                    key={user.clerkId}
                    onClick={() => {
                      switchAccount(user);
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar src={user.image} size="xs" />
                      <span>@{user.username}</span>

                    </div>
                    {isCurrentUser && <UserCheck className="w-4 h-4 text-sky-500" />}
                  </button>
                )
              })}
              <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
              <button
                onClick={async () => {

                  await signOut();
                  setIsMoreMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
          >
            <Menu className="w-6 h-6 shrink-0" />
            <span className="hidden xl:inline text-sm font-medium">More</span>
          </button>
        </div>
      </aside>

      {/* Drawer Overlay for Search */}
      {isSearchOpen && (
        <div className="fixed inset-y-0 left-16 xl:left-64 z-20 w-80 sm:w-96 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-2xl p-4 flex flex-col animate-in slide-in-from-left duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Search</h2>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="py-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            <div className="text-xs font-semibold text-neutral-400 px-1">
              {searchQuery ? 'Results' : 'Suggested Accounts'}
            </div>
            {filteredSearchUsers.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                onClick={() => {
                  setIsSearchOpen(false);
                  navigate(`/profile/${u.username}`);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Drawer Overlay for Notifications */}
      {isNotifOpen && (
        <div className="fixed inset-y-0 left-16 xl:left-64 z-20 w-80 sm:w-96 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-2xl p-4 flex flex-col animate-in slide-in-from-left duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Notifications</h2>
            <button
              onClick={() => setIsNotifOpen(false)}
              className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <Avatar src={n.senderAvatar} size="md" />
                <div className="flex-1 text-xs leading-snug">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    @{n.senderUsername}{' '}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {n.type === 'like_post' && 'liked your post.'}
                    {n.type === 'comment' && `commented: "${n.commentText}"`}
                    {n.type === 'follow' && 'started following you.'}
                    {n.type === 'mention_story' && 'mentioned you in a story.'}
                    {n.type === 'like_story' && 'liked your story.'}
                  </span>
                  <span className="block text-[10px] text-neutral-400 mt-0.5">{n.createdAt}</span>
                </div>
                {n.postImage && (
                  <img src={n.postImage} alt="post" className="w-10 h-10 object-cover rounded-lg shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { UserCard } from './UserCard';
import { useNavigate } from 'react-router-dom';

export const FollowersModal = ({ isOpen, onClose, title, usersList }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = usersList.filter((u) => {
    const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ');
    const query = search.toLowerCase();
    return u.username?.toLowerCase().includes(query) || fullName.toLowerCase().includes(query);
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        <div className="max-h-72 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-xs text-neutral-400">No accounts found</p>
          ) : (
            filtered.map((user) => (
              <UserCard
                key={user.clerkId}
                user={user}
                onClick={() => {
                  onClose();
                  navigate(`/profile/${user.username}`);
                }}
              />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
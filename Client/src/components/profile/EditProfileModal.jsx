import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { useData } from '../../context/DataContext';

export const EditProfileModal = ({ user, isOpen, onClose }) => {
  const { updateUserProfile } = useData();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setUsername(user.username || '');
      setImage(user.image || '');
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateUserProfile({ firstName, lastName, username, image });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl">
          <Avatar src={image || user.image} size="xl" />
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Profile Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">First name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Last name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>

        <div className="pt-2 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>Save</Button>
        </div>
      </form>
    </Modal>
  );
};
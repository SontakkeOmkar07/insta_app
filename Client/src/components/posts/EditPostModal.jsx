import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import {Button} from "../common/Button"
import { useData } from '../../context/DataContext';

export const EditPostModal = ({ post, isOpen, onClose }) => {
  const { updatePost } = useData();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (post) {
      setCaption(post.caption);
      setLocation(post.location || '');
    }
  }, [post]);

  if (!post) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updatePost(post._id, { caption, location });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Post" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {post.images[0] && (
          <div className="w-full h-40 rounded-xl overflow-hidden bg-black flex items-center justify-center">
            <img src={post.images[0]} alt="Post preview" className="w-full h-full object-cover" />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
            Caption
          </label>
          <textarea
            rows={3}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="pt-2 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
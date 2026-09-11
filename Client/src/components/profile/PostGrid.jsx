import React from 'react';
import { Heart, MessageCircle, Layers } from 'lucide-react';

export const PostGrid = ({ posts, onPostClick }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-400 text-sm">
        No posts shared yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-4 py-4">
      {posts.map((post) => (
        <div
          key={post._id}
          onClick={() => onPostClick(post)}
          className="relative aspect-square bg-neutral-900 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer group"
        >
          <img
            src={post.images[0]}
            alt="Post thumbnail"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {post.images.length > 1 && (
            <div className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg backdrop-blur-xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white font-bold text-sm">
            <div className="flex items-center gap-1.5">
              <Heart className="w-5 h-5 fill-white" />
              <span>{post.likes.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>{post.comments?.length || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
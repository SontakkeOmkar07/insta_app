import React, { useState } from 'react';
import { useData } from '../context/DataCOntext';
import { Heart, MessageCircle, Compass } from 'lucide-react';
import { CommentSection } from '../components/posts/CommentSection';

const exploreTags = ['All', 'Architecture', 'Nature', 'Style', 'Travel', 'Food', 'Art', 'Tech'];

const tagKeywords = {
  Architecture: ['architecture', 'architect', 'building', 'interior', 'design', 'home'],
  Nature: ['nature', 'outdoor', 'forest', 'mountain', 'ocean', 'beach', 'flower', 'sunset'],
  Style: ['style', 'fashion', 'outfit', 'clothing', 'beauty', 'streetwear'],
  Travel: ['travel', 'trip', 'vacation', 'holiday', 'adventure', 'city', 'explore'],
  Food: ['food', 'recipe', 'cooking', 'restaurant', 'dinner', 'lunch', 'breakfast'],
  Art: ['art', 'artist', 'painting', 'drawing', 'creative', 'gallery', 'photography'],
  Tech: ['tech', 'technology', 'coding', 'software', 'app', 'gadget', 'programming'],
};

const normalize = (value) => String(value || '').trim().toLowerCase();

const getPostSearchText = (post) => {
  const explicitTags = [post.category, post.tags, post.hashtags]
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter(Boolean)
    .join(' ');

  return normalize(
    [explicitTags, post.caption, post.location, post.username]
      .filter(Boolean)
      .join(' '),
  );
};

const postMatchesTag = (post, tag) => {
  if (tag === 'All') return true;

  const searchText = getPostSearchText(post);
  const words = searchText.split(/[^a-z0-9]+/).filter(Boolean);
  return [tag, ...(tagKeywords[tag] || [])].some((keyword) =>
    words.some((word) => word === normalize(keyword) || word.startsWith(normalize(keyword))),
  );
};

export const Explore = () => {
  const { posts = [], comments = [] } = useData();
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedPost, setSelectedPost] = useState(null);

  const explorePosts = posts.filter((post) => postMatchesTag(post, selectedTag));
  const getCommentCount = (post) => {
    const postId = String(post._id || post.id);
    const loadedPostComments = comments.filter(
      (comment) => String(comment.postId) === postId,
    );
    const hasLoadedComments = comments.some(
      (comment) => String(comment.postId) === postId,
    );

    return hasLoadedComments ? loadedPostComments.length : post.commentsCount || 0;
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-6 space-y-6">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {exploreTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedTag === tag
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-md'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid Layout */}
      {explorePosts.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 sm:gap-4">
          {explorePosts.map((post, idx) => {
            // Feature every 5th post as a larger 2x2 tile
            const isFeatured = idx % 5 === 2;

            return (
              <div
                key={post._id || post.id || idx}
                onClick={() => setSelectedPost(post)}
                className={`relative bg-neutral-900 rounded-lg sm:rounded-2xl overflow-hidden cursor-pointer group ${
                  isFeatured ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
                }`}
              >
                <img
                  src={post.images?.[0]}
                  alt={post.caption || 'Explore post'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white font-bold text-sm sm:text-base">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-5 h-5 fill-white" />
                    <span>{post.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>{getCommentCount(post)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 px-6 py-16 text-center">
          <Compass className="mx-auto mb-3 h-10 w-10 text-neutral-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            No {selectedTag} posts yet
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Try another category to discover more posts.
          </p>
        </div>
      )}

      {/* Post Modal */}
      <CommentSection
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
};
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PostCard } from '../components/posts/PostCard';
import { StoryBar } from '../components/stories/StoryBar';
import { RightPanel } from '../components/layout/RightPanel';
import { EditPostModal } from '../components/posts/EditPostModal';
import { CommentSection } from '../components/posts/CommentSection';
import { FollowersModal } from '../components/users/FollowersModal';

export const Home = ({ onCreateStoryClick }) => {
  const { posts, users, stories } = useData();


  console.log("HOME posts:", posts);
  console.log("HOME users:", users);
  console.log("HOME stories:", stories);


  const [editingPost, setEditingPost] = useState(null);
  const [commentingPost, setCommentingPost] = useState(null);
  const [likersPost, setLikersPost] = useState(null);

  const likersUsersList = likersPost
    ? users.filter((u) => likersPost.likes.includes(u.clerkId))
    : [];

  return (
    <div className="max-w-5xl mx-auto flex gap-10 justify-center px-2 sm:px-4 py-4">
      {/* Main Feed Container */}
      <main className="w-full max-w-xl shrink-0 min-w-0">
        {/* Story Bar */}
        <StoryBar 
         onCreateStoryClick={onCreateStoryClick} />

        {/* Posts Feed */}
        {posts.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-sm">
            No posts in your feed yet. Create one or follow users!
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onEditClick={(p) => setEditingPost(p)}
              onCommentsClick={(p) => setCommentingPost(p)}
              onLikesClick={(p) => setLikersPost(p)}
            />
          ))
        )}
      </main>

      {/* Right Sidebar (Desktop) */}
      <RightPanel />

      {/* Edit Post Modal */}
      <EditPostModal
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
      />

      {/* Comments Drawer/Modal */}
      <CommentSection
        post={commentingPost}
        isOpen={!!commentingPost}
        onClose={() => setCommentingPost(null)}
      />

      {/* Likes List Modal */}
      <FollowersModal
        isOpen={!!likersPost}
        onClose={() => setLikersPost(null)}
        title="Likes"
        usersList={likersUsersList}
      />
    </div>
  );
};
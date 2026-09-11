import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { PostGrid } from '../components/profile/PostGrid';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { FollowersModal } from '../components/users/FollowersModal';
import { CommentSection } from '../components/posts/CommentSection';
import { Grid, Bookmark, Tag } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useData } from '../context/DataCOntext';

export const Profile = () => {
  const { username: paramUsername } = useParams();
  const { currentUser } = useAuth();
  const { users, posts, stories, toggleFollowUser, openStoryViewer } = useData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // Target user lookup
  const targetUsername = paramUsername || currentUser?.username;
  const targetUser = users.find((u) => u.username?.toLowerCase() === targetUsername?.toLowerCase()) || (
    currentUser?.username?.toLowerCase() === targetUsername?.toLowerCase() ? currentUser : null
  );

  if (!targetUser) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          User Not Found
        </h2>
        <p className="text-xs text-neutral-500">The link you followed may be broken, or the page may have been removed.</p>
        <Button onClick={() => navigate('/')} variant="primary" size="sm">
          Go back to Instagram
        </Button>
      </div>
    );
  }

  const isSelf = currentUser?.clerkId === targetUser.clerkId;
  const isFollowing = currentUser?.following?.includes(targetUser.clerkId) || false;


  // Filter posts
  const userPosts = posts.filter((p) => p.userId === targetUser.clerkId);
  const savedPosts = posts.filter((p) => currentUser?.savedPosts?.includes(p._id));

  // User list for Followers / Following modal
  const followersList = users.filter((u) => targetUser.followers?.includes(u.clerkId));
  const followingList = users.filter((u) => targetUser.following?.includes(u.clerkId));

  const hasActiveStory = stories.some((s) => s.userId === targetUser.clerkId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        user={targetUser}
        postsCount={userPosts.length}
         isSelf={isSelf}
        isFollowing={isFollowing}
        onFollowToggle={() => toggleFollowUser(targetUser.clerkId)}
        onEditProfileClick={() => setIsEditModalOpen(true)}
        onFollowersClick={() => setModalType('followers')}
        onFollowingClick={() => setModalType('following')}
        onStoryClick={() => {
          if (hasActiveStory) openStoryViewer(targetUser.clerkId);
          navigate(`/stories/${targetUser.clerkId}`);
        }}

        hasStory={hasActiveStory}
      />
      <>
          {/* Tabs Navigation */}
          <div className="flex items-center justify-center gap-12 border-t border-neutral-200 dark:border-neutral-800 text-xs font-bold tracking-wider uppercase">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 py-3 border-t-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Posts</span>
            </button>

            {isSelf && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-2 py-3 border-t-2 transition-colors ${
                  activeTab === 'saved'
                    ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('tagged')}
              className={`flex items-center gap-2 py-3 border-t-2 transition-colors ${
                activeTab === 'tagged'
                  ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Tagged</span>
            </button>
          </div>

          {/* Grid Content */}
          {activeTab === 'posts' && (
            <PostGrid posts={userPosts} onPostClick={(p) => setSelectedPost(p)} />
          )}

          {activeTab === 'saved' && (
            <PostGrid posts={savedPosts} onPostClick={(p) => setSelectedPost(p)} />
          )}

          {activeTab === 'tagged' && (
            <div className="text-center py-16 text-neutral-400 text-xs">
              No tagged photos of @{targetUser.username} yet.
            </div>
          )}
        </>
      {/* Edit Profile Modal */}
      {isSelf && (
        <EditProfileModal
          user={currentUser}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Followers / Following Modal */}
      <FollowersModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        title={modalType === 'followers' ? 'Followers' : 'Following'}
        usersList={modalType === 'followers' ? followersList : followingList}
      />

      {/* Post Lightbox Modal */}
      <CommentSection
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
};

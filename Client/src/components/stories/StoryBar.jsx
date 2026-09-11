import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StoryCircle } from './StoryCircle';
import { useNavigate } from 'react-router-dom';

export const  StoryBar = ({ onCreateStoryClick }) => {
  const { currentUser } = useAuth();
  const { stories, openStoryViewer } = useData();
  const navigate = useNavigate();

  if (!currentUser) return null;

  // Group stories by the story owner's Clerk user ID.
  const storiesByUserId = stories.reduce((acc, story) => {
    acc[story.userId] = acc[story.userId] || [];
    acc[story.userId].push(story);
    return acc;
  }, {});

  const currentUserStories = storiesByUserId[currentUser.clerkId] || [];
  const otherUserIds = Object.keys(storiesByUserId).filter(
    (id) => id !== currentUser.clerkId,
  );

  const handleStoryClick = (userId) => {
    openStoryViewer(userId);
    navigate(`/stories/${encodeURIComponent(userId)}`);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3 sm:p-4 mb-6 shadow-2xs overflow-x-auto no-scrollbar flex items-center gap-4 sm:gap-5">
      {/* Current User Story */}
      <StoryCircle
        username={currentUser.username}
        avatar={currentUser.image}
        isCurrentUser={true}
        hasStory={currentUserStories.length > 0}
        isViewed={
          currentUserStories.length > 0 &&
          
          currentUserStories.every((s) => s.views?.includes(currentUser.clerkId))
        }
        onClick={() => {
          if (currentUserStories.length > 0) {
            handleStoryClick(currentUser.clerkId);
          } else {
            onCreateStoryClick();
          }
        }}
        onAddStoryClick={onCreateStoryClick}

      />

      {/* Other Users' Stories */}
      {otherUserIds.map((userId) => {
        const userStories = storiesByUserId[userId];
        const firstStory = userStories[0];
        const isAllViewed = userStories.every((s) =>
          s.views?.includes(currentUser.clerkId),
        );

        return (
          <StoryCircle
            key={userId}
            username={firstStory.username}
            avatar={firstStory.userAvatar}
            hasStory={true}
            isViewed={isAllViewed}
            onClick={() => handleStoryClick(userId)}
          />
        );
      })}
    </div>
  );
};

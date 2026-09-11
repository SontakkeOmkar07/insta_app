import React from 'react';
import { useData } from '../context/DataCOntext';
import { Avatar } from '../components/common/Avatar';
import { Heart, MessageCircle, UserPlus, AtSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Notifications = () => {
  const {
    notifications = [],
    toggleFollowUser,
    users = [],

  } = useData();

  const { currentUser } = useAuth();

  const navigate = useNavigate();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like_post':
      case 'like_story':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-sky-500 fill-sky-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'mention_story':
        return <AtSign className="w-4 h-4 text-amber-500" />;
      default:
        return <Heart className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
        Notifications
      </h1>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-2 divide-y divide-neutral-100 dark:divide-neutral-800 shadow-2xs">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 text-xs">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => {

            const senderUser = users.find((u) => u.clerkId === n.senderId);


            const isFollowing =
              currentUser?.following?.includes(senderUser?.clerkId) || false;

            console.log("Followed: ", currentUser?.following);

            return (
              <div
                key={n._id}
                className="flex items-center justify-between gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors rounded-xl"
              >
                <div
                  onClick={() => navigate(`/profile/${n.senderUsername}`)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className="relative">
                    <Avatar src={n.senderAvatar} size="md" />
                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-neutral-900 rounded-full shadow-xs">
                      {getNotificationIcon(n.type)}
                    </div>
                  </div>

                  <div className="text-xs leading-snug flex-1 min-w-0">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 hover:underline">
                      @{n.senderUsername}{' '}
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-300">
                      {n.message} {n.reaction}
                    </span>
                    <span className="block text-[10px] text-neutral-400 mt-0.5">
                      {n.createdAt}
                    </span>
                  </div>
                </div>

                {/* Right side: Post preview or Follow button */}
                {
                  n.storyImage && n.storyType === "video" ?
                    (<video
                      src={n.storyImage}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-11 h-11 object-cover rounded-xl shrink-0 cursor-pointer"
                      onClick={() => {
                        if (currentUser.clerkId) {
                          return navigate(`/stories/${currentUser.clerkId}`);
                        } else {
                          navigate(`/stories/${n.senderId}`);
                        }
                      }}
                    />
                    )
                    : n.storyImage ? (
                      <img
                        src={n.storyImage}
                        alt="Story preview"
                        className="w-11 h-11 object-cover rounded-xl shrink-0 cursor-pointer"
                        onClick={() => {
                          if (n.senderId) {
                            return navigate(`/stories/${n.senderId}`);
                          } else {
                          }
                          navigate(`/stories/${currentUser.clerkId}`);
                        }}
                      />
                    )
                      : n.postImage ? (
                        <img
                          src={n.postImage}
                          alt="Post preview"
                          className="w-11 h-11 object-cover rounded-xl shrink-0 cursor-pointer border border-neutral-200 dark:border-neutral-800"
                          onClick={() => navigate(`/posts/${currentUser.clerkId}`)}
                        />
                      ) : n.type === 'follow' && senderUser ? (
                        <button
                          onClick={() => toggleFollowUser(senderUser.clerkId)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${isFollowing
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                            : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm'
                            }`}
                        >
                          {isFollowing ? "Following" : "Follow"}
                        </button>
                      ) : null
                }
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

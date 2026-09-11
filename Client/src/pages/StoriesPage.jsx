import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Compass,
  Bookmark,
  Music,
  Flame,
  Star,
  Radio,
  Sparkles,
  Heart,
  Eye,
  Share2,
  Trash2,
  UserPlus,
  UserCheck,
  Search,
} from 'lucide-react';
import { useData } from '../context/DataCOntext';
import { CreateStoryModal } from '../components/stories/CreateStoryModal';
import { MusicSelector } from '../components/music/MusicSelector';
import { SavedStories } from '../components/stories/SavedStories';
import { TrendingStories } from '../components/stories/TrendingStories';
import { useAuth } from '../context/AuthContext';

export const StoriesPage = () => {
  const { userId: routeUserId } = useParams();

  const navigate = useNavigate();

  const {
    stories,
    users,
    openStoryViewer,
    toggleFollowUser,
    likeStory,
    deleteStory,
    showToast,
  } = useData();

  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('Feed');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  // const [isBuffering, setIsBuffering] = useState(false);

  // Sync route param with openStoryViewer
  useEffect(() => {
    if (routeUserId) {
      const matchedStory = stories.find(
        (s) =>
          s.userId === routeUserId ||
          s.username.toLowerCase() === routeUserId.toLowerCase()
      );
      if (matchedStory) {
        openStoryViewer(matchedStory.userId);
      } else if (stories.length > 0) {
        showToast('No active stories found for this user', 'info');
      }
    }
  }, [routeUserId, stories]);

  // Filter stories by category and search query
  const filteredStories = stories.filter((story) => {
    if (selectedCategory === 'Following') {
      if (!currentUser?.following.includes(story.userId) && story.userId !== currentUser?.clerkId) return false;
    } else if (selectedCategory === 'Close Friends') {
      if (!story.isCloseFriends) return false;
    } else if (selectedCategory === 'Trending') {
      if (story.category !== 'Trending' && story.likes.length < 2) return false;
    } else if (selectedCategory === 'Popular') {
      if (story.category !== 'Popular' && story.views.length < 3) return false;
    } else if (selectedCategory === 'Live') {
      if (!story.isLive) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        story.username.toLowerCase().includes(q) ||
        (story.caption && story.caption.toLowerCase().includes(q)) ||
        (story.location && story.location.toLowerCase().includes(q))
      );
    }

    return true;
  });

  // Group stories by creator for top horizontal avatar ring carousel
  const creatorsWithStoriesMap = new Map();
  stories.forEach((s) => {
    const list = creatorsWithStoriesMap.get(s.userId) || [];
    list.push(s);
    creatorsWithStoriesMap.set(s.userId, list);
  });

  const creatorStoriesList = Array.from(creatorsWithStoriesMap.entries())
    // The current user already has the dedicated "Your Story" card above.
    .filter(([userId]) => userId !== currentUser?.clerkId)
    .map(([userId, userStories]) => {
    const userObj = users.find((u) => u.clerkId === userId);
    const firstStory = userStories[0];
    const hasUnviewed = userStories.some((s) => !s.views.includes(currentUser?.clerkId || ''));
    const isCloseFriends = userStories.some((s) => s.isCloseFriends);
    const isLive = userStories.some((s) => s.isLive);

    return {
      userId,
      username: firstStory.username,
      userAvatar: firstStory.userAvatar,
      userObj,
      storyCount: userStories.length,
      hasUnviewed,
      isCloseFriends,
      isLive,
      latestStory: firstStory,
    };
    });

  const handleShareCard = (e, storyId) => {
    e.stopPropagation();
    showToast('Story link copied to clipboard!');
  };


   const handleStoryClick = (userId) => {
    openStoryViewer(userId);
    navigate(`/stories/${encodeURIComponent(userId)}`);
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-md">
            <Sparkles className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
                Instagram Stories
              </h1>
              <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-500 rounded-full text-[10px] font-extrabold uppercase tracking-wider animate-pulse border border-rose-500/20">
                Live
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Share real-time photo & video moments with music, stickers, and polls
            </p>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('Feed')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'Feed'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-md'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
          >
            <Compass className="w-4 h-4 text-sky-500" />
            <span>Stories Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('Trending')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'Trending'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-md'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
          >
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Trending & Discovery</span>
          </button>

          <button
            onClick={() => setActiveTab('Saved')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'Saved'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-md'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>Saved</span>
          </button>

          <button
            onClick={() => setIsMusicModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-all cursor-pointer border border-purple-500/20"
          >
            <Music className="w-4 h-4" />
            <span>Music Hub</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-rose-500 text-white text-xs font-bold shadow-lg hover:shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Story</span>
          </button>
        </div>
      </div>

      {/* Main Stories Content Area */}
      {activeTab === 'Trending' ? (
        <TrendingStories />
      ) : activeTab === 'Saved' ? (
        <SavedStories />
      ) : (
        <div className="space-y-8">
          {/* Creator Story Rings Carousel Row */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-3xl space-y-3 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 px-1">
              Active Creator Stories
            </h3>

            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 pt-1">
              {/* Add Story Button Card */}
              <div
                
                className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
              >
                <div className="relative w-18 h-18 rounded-full p-0.5 border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center group-hover:border-sky-500 transition-colors">
                  <img
                    src={
                      currentUser?.image ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                    }
                    onClick={() => handleStoryClick(currentUser.clerkId)}

                    alt="Your Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-sky-500 text-white ring-2 ring-white dark:ring-neutral-900 group-hover:scale-110 transition-transform">
                    <Plus 
                   onClick={() => setIsCreateModalOpen(true)} 
                    className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Your Story
                </span>
              </div>

              {/* Creator Rings List */}
              {creatorStoriesList.map((creator) => {
                const isFollowing = currentUser?.following.includes(creator.userId) || false;
                const isSelf = currentUser?.clerkId === creator.userId;

                return (
                  <div
                    key={creator.userId}
                    onClick={() => {
                      openStoryViewer(creator.userId);
                      navigate(`/stories/${creator.userId}`);
                    }}
                    className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group relative"
                  >
                    {/* Ring border based on state */}
                    <div
                      className={`relative w-18 h-18 rounded-full p-1 transition-transform group-hover:scale-105 ${creator.isLive
                          ? 'bg-gradient-to-tr from-rose-600 via-pink-600 to-purple-600 animate-pulse'
                          : creator.isCloseFriends
                            ? 'bg-gradient-to-tr from-emerald-400 to-green-600'
                            : creator.hasUnviewed
                              ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'
                              : 'bg-neutral-300 dark:bg-neutral-700'
                        }`}
                    >
                      <img
                        src={creator.userAvatar}
                        alt={creator.username}
                        className="w-full h-full rounded-full object-cover ring-2 ring-white dark:ring-neutral-900"
                      />

                      {creator.isLive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-md bg-rose-600 text-[8px] font-black text-white uppercase tracking-wider shadow-sm">
                          LIVE
                        </span>
                      )}
                    </div>

                    <div className="text-center max-w-[80px]">
                      <span className="block text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        @{creator.username}
                      </span>
                      {!isSelf && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollowUser(creator.userId);
                          }}
                          className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${isFollowing
                              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                              : 'bg-sky-500 text-white hover:bg-sky-600'
                            }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search & Category Pills Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {['All', 'Following', 'Close Friends', 'Trending', 'Popular', 'Live'].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === cat
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm'
                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700/60'
                      }`}
                  >
                    {cat === 'Close Friends' && '⭐ '}
                    {cat === 'Live' && '🔴 '}
                    {cat === 'Trending' && '🔥 '}
                    {cat}
                  </button>
                )
              )}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search stories or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Stories Visual Grid */}
          {filteredStories.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
                No stories match "{selectedCategory}"
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Be the first to share a story or try selecting another category above!
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold shadow-md hover:bg-sky-600 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Story
              </button>
            </div>
          ) : (
            // show stories
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {filteredStories.map((story) => {
                const isLiked = currentUser ? story.likes.includes(currentUser.clerkId) : false;
                const isFollowing = currentUser?.following.includes(story.userId) || false;
                const isSelf = currentUser?.clerkId === story.userId;

                return (
                  <div
                    key={story._id}
                    onClick={() => {
                      openStoryViewer(story.userId);
                      navigate(`/stories/${story.userId}`);
                    }}
                    className="group relative aspect-[9/16] rounded-3xl overflow-hidden bg-neutral-900 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer border border-neutral-800"
                  >
                    {/* Media */}
                    {story.type === 'video' ? (
                      <video
                        src={story.mediaUrl}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                        preload="metadata"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}

                        onError={(e) => {
                          console.error('Video failed to load:', {
                            url: story.mediaUrl,
                            error: e.currentTarget.error,
                          });
                        }}
                      />
                    ) : (
                      <img src={story.mediaUrl} alt={story.caption} className="w-full h-full object-cover " />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 p-3.5 flex flex-col justify-between">
                      {/* Top Header Row inside Card */}
                      <div className="flex items-center justify-between gap-1 z-10">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={story.userAvatar}
                            alt={story.username}
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-white/80"
                          />
                          <span className="text-xs font-bold text-white truncate max-w-[80px]">
                            @{story.username}
                          </span>
                        </div>

                        {/* delete your own story */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isSelf && (
                            <button
                              type="button"
                              aria-label="Delete story"
                              title="Delete story"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Delete this story?')) {
                                  deleteStory(story._id);
                                }
                              }}
                              className="p-1.5 rounded-full bg-black/50 text-white hover:bg-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Follow Button directly on each Story Card! */}
                          {!isSelf && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFollowUser(story.userId);
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer shrink-0 shadow-md ${isFollowing
                                  ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
                                  : 'bg-sky-500 hover:bg-sky-600 text-white'
                                }`}
                            >
                              {isFollowing ? 'Following' : 'Follow'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Music or Location Tag */}
                      {story.music && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold self-start my-auto">
                          <Music className="w-3 h-3 text-sky-400 animate-spin" />
                          <span className="truncate max-w-[110px]">{story.music.songTitle}</span>
                        </div>
                      )}

                      {/* Bottom Footer Info */}
                      <div className="space-y-2 z-10">
                        {story.caption && (
                          <p className="text-xs font-semibold text-white line-clamp-2 drop-shadow-sm">
                            {story.caption}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-neutral-300 pt-1 border-t border-white/10">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                likeStory(story._id);
                              }}
                              className="flex items-center cursor-pointer gap-1 hover:text-rose-400 transition-colors"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                              <span>{story.likes.length}</span>
                            </button>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-sky-400" />
                              <span>{story.views.length}</span>
                            </span>
                          </div>

                          <button
                            onClick={(e) => handleShareCard(e, story._id)}
                            className="p-1 hover:text-white transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateStoryModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      {isMusicModalOpen && (
        <MusicSelector
          onClose={() => setIsMusicModalOpen(false)}
          onSelectMusic={(mus) => {
            showToast(`Selected "${mus.songTitle}" for your next story!`);
            setIsMusicModalOpen(false);
            setIsCreateModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

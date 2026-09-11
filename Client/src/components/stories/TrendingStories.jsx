import React, { useEffect, useState } from 'react';
import { Flame, Hash, Music, UserPlus, Sparkles, Eye, Heart } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { musicService } from '../../services/musicService';
import { songService } from '../../services/songService';

export const TrendingStories = () => {
  const { stories, users, currentUser, toggleFollowUser, openStoryViewer } = useData();
  const [trendingSongs, setTrendingSongs] = useState([]);

  useEffect(() => {
    songService.getSongs('Trending')
      .then((songs) => setTrendingSongs(songs.slice(0, 3)))
      .catch(() => {});
  }, []);

  const trendingStoriesList = stories.filter((s) => s.category === 'Trending' || s.isLive || s.likes.length >= 2);
  const suggestedUsers = users.filter((u) => u.clerkId !== currentUser?.clerkId && !currentUser?.following.includes(u.clerkId));

  const HASHTAGS = [
    { name: '#webdev', posts: '1.2M stories' },
    { name: '#goldenhour', posts: '850K stories' },
    { name: '#designtok', posts: '640K stories' },
    { name: '#music2026', posts: '420K stories' },
    { name: '#traveldiaries', posts: '910K stories' },
  ];

  return (
    <div className="space-y-8">
      {/* Trending Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md">
          <Flame className="w-6 h-6 fill-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            Trending & Discovery <Sparkles className="w-4 h-4 text-amber-500" />
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Top creators, viral hashtags, and trending story audio today
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Popular Stories Stream */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" /> Viral Stories
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {trendingStoriesList.map((story) => (
              <div
                key={story._id}
                onClick={() => openStoryViewer(story.userId)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {story.type === 'video' ? (
                  <video src={story.mediaUrl} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={story.mediaUrl} alt={story.caption} className="w-full h-full object-cover" />
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    {story.isLive ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-extrabold uppercase tracking-wider animate-pulse shadow-md">
                        🔴 LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] text-white font-medium">
                        {story.createdAt}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={story.userAvatar}
                        alt={story.username}
                        className="w-6 h-6 rounded-full object-cover ring-2 ring-rose-500"
                      />
                      <span className="text-xs font-bold text-white truncate">@{story.username}</span>
                    </div>
                    {story.caption && (
                      <p className="text-[11px] text-neutral-200 line-clamp-2">{story.caption}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-neutral-300 pt-1">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> {story.likes.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-sky-400" /> {story.views.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Trending Hashtags, Songs & Creators */}
        <div className="space-y-6">
          {/* Trending Hashtags */}
          <div className="bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/70 rounded-3xl p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Hash className="w-4 h-4 text-sky-500" /> Popular Hashtags
            </h3>
            <div className="space-y-2">
              {HASHTAGS.map((tag) => (
                <div
                  key={tag.name}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-sky-500">{tag.name}</span>
                  <span className="text-[10px] text-neutral-400">{tag.posts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Trending Music */}
          <div className="bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/70 rounded-3xl p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-500" /> Viral Story Tracks
            </h3>
            <div className="space-y-2">
              {trendingSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => musicService.playPreview(song.id)}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors cursor-pointer"
                >
                  <img src={song.albumArt} alt={song.title} className="w-10 h-10 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {song.title}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate">{song.artist}</p>
                  </div>
                  <span className="text-[10px] font-extrabold text-sky-500 bg-sky-50 dark:bg-sky-950 px-2 py-1 rounded-full">
                    Preview
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Creators */}
          <div className="bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/70 rounded-3xl p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-500" /> Recommended Creators
            </h3>
            <div className="space-y-3">
              {suggestedUsers.slice(0, 3).map((user) => (
                <div key={user.clerkId} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.profileImage}
                      alt={user.username}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        @{user.username}
                      </p>
                      <p className="text-[10px] text-neutral-500 truncate">{user.fullName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollowUser(user.clerkId)}
                    className="px-3 py-1 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

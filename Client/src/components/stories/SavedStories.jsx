import React, { useState } from 'react';
import { Bookmark, Play, Music, Image as ImageIcon, Film, FileText, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataCOntext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SavedStories = () => {


  const  navigate = useNavigate();
  
  const { stories, posts, openStoryViewer } = useData();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('All');

  // Derive saved items from saved stories and posts
  const savedStoriesList = stories
    .filter((s) => s.savedBy?.includes(currentUser?.id || ''))
    .map((s) => ({
      id: `saved-story-${s.id}`,
      type: s.type === 'video' ? 'video' : 'story',
      title: s.caption || `Story by @${s.username}`,
      thumbnail: s.mediaUrl,
      authorUsername: s.username,
      authorAvatar: s.userAvatar,
      dateSaved: s.createdAt,
      metaInfo: s.music ? `🎵 ${s.music.songTitle}` : s.location || 'Story',
      originalId: s.id,
    }));

  const savedPostsList = posts
    .filter((p) => currentUser?.savedPosts?.includes(p._id))
    .map((p) => ({
      id: `saved-post-${p._id}`,
      type: 'post',
      title: p.caption || `Post by @${p.username}`,
      thumbnail: p.images[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      authorUsername: p.username,
      authorAvatar: p.userAvatar,
      dateSaved: p.createdAt,
      metaInfo: `❤️ ${p.likes.length} likes`,
      originalId: p._id,
    }));

  const allSavedItems = [...savedStoriesList, ...savedPostsList];

  const filteredItems = allSavedItems.filter((item) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Stories') return item.type === 'story';
    if (activeTab === 'Videos') return item.type === 'video';
    if (activeTab === 'Images') return item.type === 'image' || item.type === 'story';
    if (activeTab === 'Posts') return item.type === 'post';
    return true;
  });



  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
            <Bookmark className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Saved Collection</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {allSavedItems.length} items saved to your private library
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['All', 'Stories', 'Videos', 'Images', 'Posts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Saved Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/40 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Bookmark className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            No saved items in "{activeTab}"
          </p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Click the save bookmark icon on any story or post to save it for later viewing here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.type === 'story' || item.type === 'video') {
                  const storyObj = stories.find((s) => s.id === item.originalId);
                  if (storyObj) openStoryViewer(storyObj.userId);
                  navigate(`/stories/${storyObj.userId}`);
                }
              }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >

              {item.type === 'video' ? (
                <video src={item.thumbnail} className="w-full h-full object-cover" muted />
              ) : (
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    {item.type === 'video' && <Film className="w-3 h-3 text-sky-400" />}
                    {item.type === 'story' && <ImageIcon className="w-3 h-3 text-rose-400" />}
                    {item.type === 'post' && <FileText className="w-3 h-3 text-amber-400" />}
                    {item.type}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.authorAvatar}
                      alt={item.authorUsername}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-white/50"
                    />
                    <span className="text-xs font-bold text-white truncate">@{item.authorUsername}</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 line-clamp-1">{item.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

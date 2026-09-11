import React, { useState, useEffect } from 'react';
import { Search, X, Music, Check, Volume2 } from 'lucide-react';
import { musicService } from '../../services/musicService';
import { songService } from '../../services/songService';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataCOntext';
import { SongCard } from './SongCard';

const CATEGORIES = ['All', 'Trending', 'Popular', 'Recently Used', 'Saved', 'Recommended'];

export const MusicSelector = ({ onClose, onSelectMusic, selectedMusic }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [songs, setSongs] = useState([]);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [chosenSong, setChosenSong] = useState(null);
  const [musicStartSec, setMusicStartSec] = useState(0);
  const { isAuthenticated } = useAuth();
  const { showToast } = useData();

  useEffect(() => {
    let cancelled = false;
    songService.getSongs(activeCategory)
      .then((list) => {
        if (cancelled) return;
        const query = searchQuery.trim().toLowerCase();
        setSongs(query
          ? list.filter((song) => song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query))
          : list);
      })
      .catch((error) => {
        if (!cancelled) showToast(error.response?.data?.message || 'Failed to load songs', 'error');
      });
    return () => { cancelled = true; };
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    return () => {
      musicService.stopPreview();
    };
  }, []);

  const handlePlayToggle = (song) => {
    if (playingSongId === song.id) {
      musicService.stopPreview();
      setPlayingSongId(null);
    } else {
      musicService.playPreview(song);
      setPlayingSongId(song.id);
    }
  };

  const handleSaveToggle = async (songId) => {
    if (!isAuthenticated) {
      showToast('Please log in first', 'error');
      return;
    }

    const song = songs.find((item) => item.id === songId);
    if (!song) return;

    const nextSavedState = !song.isSaved;
    setSongs((previous) => previous.map((item) => item.id === songId
      ? { ...item, isSaved: nextSavedState }
      : item));

    try {
      const updatedSong = song.isSaved
        ? await songService.unsaveSong(songId)
        : await songService.saveSong(songId);
      setSongs((previous) => previous.map((item) => item.id === songId ? updatedSong : item));
    } catch (error) {
      setSongs((previous) => previous.map((item) => item.id === songId
        ? { ...item, isSaved: song.isSaved }
        : item));
      showToast(error.response?.data?.message || 'Failed to update saved song', 'error');
    }
  };

  const handlePickSong = (song) => {
    setChosenSong(song);
  };

  const handleAttachMusic = () => {
    if (!chosenSong) return;
    musicService.stopPreview();
    onSelectMusic({
      songId: chosenSong.id,
      songTitle: chosenSong.title,
      artist: chosenSong.artist,
      albumArt: chosenSong.albumArt,
      audioUrl: chosenSong.audioUrl,
      startSec: musicStartSec,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Music & Songs
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Pick a track for your story
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              musicService.stopPreview();
              onClose();
            }}
            className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 space-y-3 bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search songs or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {songs.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              No songs found in this category. Try another search.
            </div>
          ) : (
            songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                isPlaying={playingSongId === song.id}
                onPlayToggle={handlePlayToggle}
                onSaveToggle={handleSaveToggle}
                onSelectSong={handlePickSong}
                isSelected={chosenSong?.id === song.id || selectedMusic?.songId === song.id}
              />
            ))
          )}
        </div>

        {/* Selected Song Preview & Trimmer Slider */}
        {chosenSong && (
          <div className="p-4 bg-sky-500/10 border-t border-sky-500/20 space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={chosenSong.albumArt}
                  alt={chosenSong.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                    {chosenSong.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {chosenSong.artist}
                  </p>
                </div>
              </div>
              <button
                onClick={handleAttachMusic}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply Track</span>
              </button>
            </div>

            {/* Duration Segment Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                <span>Start Clip: {musicStartSec}s</span>
                <span className="flex items-center gap-1 text-sky-500">
                  <Volume2 className="w-3 h-3" /> 15s Story Audio Segment
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={musicStartSec}
                onChange={(e) => setMusicStartSec(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

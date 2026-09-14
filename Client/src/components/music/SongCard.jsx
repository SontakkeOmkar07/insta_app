import React from 'react';
import { Play, Pause, Bookmark, Music, Plus } from 'lucide-react';

export const SongCard = ({
  song,
  isPlaying,
  onPlayToggle,
  onSaveToggle,
  onSelectSong,
  isSelected,
}) => {


  return (
    <div
      className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
        isSelected
          ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-sm'
          : 'bg-white dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700/70 hover:border-neutral-300 dark:hover:border-neutral-600'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Album Artwork with Play Overlay */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-700">
          <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayToggle(song);
            }}
            className={`absolute inset-0 flex items-center justify-center transition-opacity ${
              isPlaying ? 'bg-black/50 opacity-100' : 'bg-black/30 opacity-0 group-hover:opacity-100'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white fill-white" />
            ) : (
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            )}
          </button>
          {isPlaying && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-2">
              <span className="w-0.5 h-full bg-sky-400 animate-pulse" />
              <span className="w-0.5 h-2/3 bg-sky-400 animate-pulse delay-75" />
              <span className="w-0.5 h-full bg-sky-400 animate-pulse delay-150" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
              {song.title}
            </h4>
            {song.isTrending && (
              <span className="px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-rose-500 text-[9px] font-extrabold text-white rounded-full uppercase tracking-wider shrink-0">
                Trending
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
            {song.artist}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400">
            <span className="flex items-center gap-1">
              <Music className="w-3 h-3 text-sky-500" /> {song.duration}
            </span>
            <span>•</span>
            <span>{song.category}</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {onSaveToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSaveToggle(song.id);
            }}
            className="p-2 text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            title={song.isSaved ? 'Unsave song' : 'Save song'}
          >
            <Bookmark className={`w-4 h-4 ${song.isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
        )}

        {onSelectSong && (
          <button
            onClick={() => onSelectSong(song)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isSelected
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-sky-500 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isSelected ? 'Added' : 'Add'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
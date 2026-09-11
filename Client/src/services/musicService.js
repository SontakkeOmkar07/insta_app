let currentAudio = null;
let currentPlayingSongId = null;

const stopAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.src = '';
    currentAudio = null;
  }
  currentPlayingSongId = null;
};

const createAudio = (song) => {
  if (!song?.audioUrl) return false;

  const songId = song.id || song.songId || song.audioUrl;
  currentPlayingSongId = songId;
  currentAudio = new Audio(song.audioUrl);
  currentAudio.loop = true;
  currentAudio.volume = 0.6;
  currentAudio.currentTime = Number(song.startSec || 0);
  currentAudio.play().catch((error) => {
    console.warn('Audio could not start:', error);
  });
  return true;
};

export const musicService = {
  playPreview(song) {
    const songId = typeof song === 'string' ? song : song?.id || song?.songId;

    if (!songId) return;
    if (currentPlayingSongId === songId) {
      stopAudio();
      return;
    }

    stopAudio();
    createAudio(song);
  },

  // Story playback must not toggle off when React refreshes the story object
  // after recording a view.
  playStory(song) {
    const songId = song?.id || song?.songId || song?.audioUrl;
    if (!songId || !song?.audioUrl) return;
    if (currentPlayingSongId === songId && currentAudio) return;

    stopAudio();
    createAudio(song);
  },

  stopPreview: stopAudio,
  getCurrentPlayingId: () => currentPlayingSongId,
};

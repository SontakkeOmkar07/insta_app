let currentAudio = null;
let currentPlayingSongId = null;

const stopAudio = () => {
  if (currentAudio) {

    const audio = currentAudio;
    currentAudio.pause();

    // remove source completely
    currentAudio.removeAttribute("src");
    currentAudio.currentTime = 0;
    currentAudio.src = '';
    currentAudio.load();
    currentAudio = null;

     if (!audio) return;

     try {

          audio.pause();


           // Remove all event listeners that we added.
    audio.onloadedmetadata = null;
    audio.onerror = null;
    audio.onended = null;
    audio.oncanplay = null;

        // Completely remove the source.
    audio.removeAttribute("src");
    audio.load();
      
     } catch (error) {
          console.error("Error while stopping audio:", error);

      
     }
  }
  currentPlayingSongId = null;
};

const createAudio = async (song) => {
  if (!song?.audioUrl){ 

        console.error("Audio URL is missing:", song);

    return false};

  const songId = song.id || song.songId || song.audioUrl;


  currentPlayingSongId = songId;

  currentAudio = new Audio();
  currentAudio.src = song.audioUrl;
  currentAudio.preload = "auto";
  currentAudio.loop = true;
  currentAudio.volume = 0.6;

  const startSec = Number(song.startSec || 0);


  currentAudio.addEventListener("loadedmetadata", () => {
    if (
      Number.isFinite(startSec) &&
      startSec >= 0 &&
      startSec < currentAudio.duration
    ) {
      currentAudio.currentTime = startSec;
    }
  });

    currentAudio.addEventListener("error", () => {
    console.error("Audio failed to load.");
    console.error("URL:", song.audioUrl);
    console.error("Audio element error:", currentAudio.error);

    currentPlayingSongId = null;
    currentAudio = null;
  });

 currentAudio.addEventListener("ended", () => {
    if (currentAudio?.loop) return;

    currentPlayingSongId = null;
  });


    console.log("Trying to play:", song.audioUrl);

  
     currentAudio
    .play()
    .then(() => {
      console.log("Audio started successfully:", song.title);
    })
    .catch((error) => {
      console.error("Audio could not start:", error);
    });


    return true;
};

export const musicService = {
  playPreview(song) {
    if (!song) return;
    
    const songId = song.id || song.songId || song.audioUrl;
    if (!songId) {
      console.error("Song ID is missing:", song);

      return;
    }

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

    if ( !song?.audioUrl) {

            console.error("Story audio URL is missing:", song);

      return;
    }

    const songId = song?.id || song?.songId || song?.audioUrl;
    
    if (currentPlayingSongId === songId && currentAudio) return;

    stopAudio();
    createAudio(song);
  },

  stopPreview: stopAudio,
  getCurrentPlayingId: () => currentPlayingSongId,
};

import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { useData } from '../../context/DataContext';
import { storyService } from '../../services/storyService';
import {
  Image as ImageIcon,
  Film,
  Music,
  MapPin,
  AtSign,
  Smile,
  BarChart2,
  HelpCircle,
  Star,
  Check,
  X,
  Upload,
  Search,
  UserPlus,
} from 'lucide-react';
import { MusicSelector } from '../music/MusicSelector';
import { useAuth } from '../../context/AuthContext';
// import { useNavigate } from 'react-router-dom';

export const CreateStoryModal = ({ isOpen, onClose }) => {

  const { userId, currentUser } = useAuth();

  const { createStory, showToast, users } = useData();

  const [mediaType, setMediaType] = useState('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [selectedMentions, setSelectedMentions] = useState([]);
  const [mentionsInput, setMentionsInput] = useState('');
  const [isCloseFriends, setIsCloseFriends] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(undefined);

  // Sticker Modes
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [showPollInput, setShowPollInput] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('Yes or No?');
  const [pollOpt1, setPollOpt1] = useState('Yes');
  const [pollOpt2, setPollOpt2] = useState('No');

  const [showQuestionInput, setShowQuestionInput] = useState(false);

  const [questionPrompt, setQuestionPrompt] = useState('Ask any question?');

  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // mention
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const mentionContainerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        mentionContainerRef.current &&
        !mentionContainerRef.current.contains(e.target)
      ) {
        setIsMentionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleToggleMention = (clerkId) => {
    setSelectedMentions((prev) =>
      prev.includes(clerkId)
        ? prev.filter((id) => id !== clerkId)
        : [...prev, clerkId]
    );
  };

  const handleRemoveMention = (clerkId, e) => {
    e?.stopPropagation();
    setSelectedMentions((prev) => prev.filter((id) => id !== clerkId));
  };

  const filteredUsers = (users || [])
    .filter((u) => u.clerkId !== userId && u.clerkId !== currentUser?.clerkId)
    .filter((u) => {
      if (!mentionsInput.trim()) return true;
      const q = mentionsInput.trim().toLowerCase().replace(/^@/, '');
      const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ').toLowerCase();
      const username = (u.username || '').toLowerCase();
      return username.includes(q) || fullName.includes(q);
    });

  const presetImages = [
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
  ];

  const presetVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  ];

  const EMOJI_PRESETS = ['🔥', '❤️', '✨', '☕', '🚀', '🎨', '🏖️', '💯'];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxVideoSize = 50 * 1024 * 1024;
      if (file.type.startsWith('video/') && file.size > maxVideoSize) {
        showToast('Video is too large. Maximum size is 100 MB.', 'error');
        e.target.value = '';
        return;
      }

      const isVid = file.type.startsWith('video');
      setMediaType(isVid ? 'video' : 'image');
      setSelectedFile(file);

      if (isVid) {
        // Blob URL is only for local preview. The actual video is uploaded on submit.
        setMediaUrl(URL.createObjectURL(file));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => setMediaUrl(String(reader.result));
      reader.onerror = () => showToast('Could not read the selected file', 'error');
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    let finalUrl = mediaUrl.trim() || presetImages[0];

    if (selectedFile?.type.startsWith('video/')) {
      const uploaded = await storyService.uploadMedia(selectedFile);
      finalUrl = uploaded.url;
    }

    setIsLoading(true);
    try {

      let pollData = undefined;
      if (showPollInput) {
        pollData = {
          question: pollQuestion || 'Vote',
          options: [
            {
              text: pollOpt1 || "Yes",
              votes: []
            },
            {
              text: pollOpt2 || "No",
              votes: []
            },

          ],
        };
      }

      let questionData = undefined;
      if (showQuestionInput) {
        questionData = {
          prompt: questionPrompt || 'Ask me anything!',
          responses: [],
        };
      }

      await createStory({
        userId,
        userAvatar: currentUser?.image,
        mediaUrl: finalUrl,
        type: mediaType,
        caption,
        location,
        music: selectedMusic || undefined,
        poll: pollData,
        question: questionData,
        isCloseFriends,
        mentions: selectedMentions,
      });

      // Reset
      setMediaUrl('');
      setSelectedFile(null);
      setCaption('');
      setLocation('');
      setMentionsInput('');
      setSelectedMentions([]);
      setIsMentionOpen(false);
      setSelectedMusic(undefined);
      setShowPollInput(false);
      setShowQuestionInput(false);
      onClose();
      showToast("Story created successfully!", "success");

    } catch (e) {
      console.error(e);
      showToast('Error creating story', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Create Instagram Story" maxWidth="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Top Bar: Media Type Selector */}
          <div className="flex items-center justify-between p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => {
                setMediaType('image');
                if (!mediaUrl || presetVideos.includes(mediaUrl)) setMediaUrl(presetImages[0]);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${mediaType === 'image'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
            >
              <ImageIcon className="w-4 h-4 text-sky-500" />
              <span>Photo Story</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMediaType('video');
                setMediaUrl(presetVideos[0]);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${mediaType === 'video'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
            >
              <Film className="w-4 h-4 text-rose-500" />
              <span>Video Story</span>
            </button>
          </div>

          {/* Media Presets or Upload */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
              Select Preset or Upload Custom File
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {mediaType === 'image'
                ? presetImages.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setSelectedFile(null);
                      setMediaUrl(preset);
                    }}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-transform hover:scale-105 ${mediaUrl === preset ? 'border-sky-500 ring-2 ring-sky-500/30' : 'border-transparent opacity-80'
                      }`}
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))
                : presetVideos.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setSelectedFile(null);
                      setMediaUrl(preset);
                    }}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-transform hover:scale-105 ${mediaUrl === preset ? 'border-sky-500 ring-2 ring-sky-500/30' : 'border-transparent opacity-80'
                      }`}
                  >
                    <video src={preset} className="w-full h-full object-cover" muted />
                  </button>
                ))}
            </div>

            {/* Custom URL or File Upload */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder={mediaType === 'image' ? 'https://images.unsplash.com/your-image.jpg' : 'https://example.com/video.mp4'}
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer shrink-0">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
                <input
                  type="file"
                  accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Interactive Live Story Preview with Overlay Badges */}
          <div className="relative aspect-[9/16] max-h-64 rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-lg border border-neutral-800">
            {mediaType === 'video' ? (
              <video src={mediaUrl || presetVideos[0]} className="w-full h-full object-cover" autoPlay loop muted />
            ) : (
              <img src={mediaUrl || presetImages[0]} alt="Story preview" className="w-full h-full object-cover" />
            )}

            {/* Top Overlay Badges */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
              {isCloseFriends && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold tracking-wider flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-white" /> Close Friends
                </span>
              )}
              {selectedMusic && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  <Music className="w-3 h-3 text-sky-400 animate-spin" />
                  <span>{selectedMusic.songTitle}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>{location}</span>
                </div>
              )}
            </div>

            {/* Sticker Overlays in Preview */}
            <div className="absolute inset-x-4 bottom-12 space-y-2 text-center z-10">
              {caption && (
                <span className="inline-block bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md">
                  {caption}
                </span>
              )}
              {/* Mention Badges in Story Live Preview */}
              {selectedMentions.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 max-w-xs mx-auto">
                  {selectedMentions.map((mId) => {
                    const u = (users || []).find((user) => user.clerkId === mId);
                    return (
                      <span
                        key={mId}
                        className="inline-flex items-center gap-1 bg-white/95 dark:bg-black/85 text-neutral-900 dark:text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md backdrop-blur-md"
                      >
                        <AtSign className="w-2.5 h-2.5 text-sky-500 stroke-[2.5]" />
                        <span>{u?.username || 'user'}</span>
                      </span>
                    );
                  })}
                </div>
              )}
              {showPollInput && (
                <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl shadow-xl text-xs max-w-xs mx-auto border border-neutral-200 dark:border-neutral-700">
                  <p className="font-bold text-neutral-900 dark:text-white mb-2">{pollQuestion}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="p-2 bg-sky-50 dark:bg-sky-950/50 text-sky-600 font-bold rounded-xl text-center">
                      {pollOpt1}
                    </span>
                    <span className="p-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-center">
                      {pollOpt2}
                    </span>
                  </div>
                </div>
              )}
              {showQuestionInput && (
                <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white p-3 rounded-2xl shadow-xl text-xs max-w-xs mx-auto">


                  <input
                    type="text"
                    value={questionPrompt}
                    onChange={(e) => setQuestionPrompt(e.target.value)}
                    className="w-full bg-transparent text-white font-bold mb-1 text-center outline-none border-none"
                  />

                  <div className="bg-white/20 p-2 rounded-xl text-[10px] text-white/80">
                    Type a response...
                  </div>
                </div>
              )}
              {selectedEmoji && (
                <div className="text-4xl drop-shadow-md animate-bounce">{selectedEmoji}</div>
              )}
            </div>
          </div>

          {/* Sticker Toolbar */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Add Interactive Stickers & Music
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsMusicModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedMusic
                  ? 'bg-sky-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
              >
                <Music className="w-4 h-4" />
                <span>{selectedMusic ? selectedMusic.songTitle : 'Add Music'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMentionOpen(!isMentionOpen);
                  if (!isMentionOpen && mentionContainerRef.current) {
                    mentionContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedMentions.length > 0 || isMentionOpen
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
              >
                <AtSign className="w-4 h-4" />
                <span>
                  {selectedMentions.length > 0
                    ? `Mentions (${selectedMentions.length})`
                    : 'Mention (@)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowPollInput(!showPollInput)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${showPollInput
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Poll Sticker</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQuestionInput(!showQuestionInput)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${showQuestionInput
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Question Box</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCloseFriends(!isCloseFriends)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isCloseFriends
                  ? 'bg-emerald-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
              >
                <Star className="w-4 h-4 fill-current" />
                <span>Close Friends</span>
              </button>
            </div>
          </div>

          {/* Extended Sticker Controls Inputs */}
          {showPollInput && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                  Configure Poll Sticker
                </span>
                <button type="button" onClick={() => setShowPollInput(false)}>
                  <X className="w-4 h-4 text-purple-400" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Question (e.g., Which outfit?)"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-purple-200 dark:border-purple-800 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Option 1"
                  value={pollOpt1}
                  onChange={(e) => setPollOpt1(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-purple-200 dark:border-purple-800 text-xs"
                />
                <input
                  type="text"
                  placeholder="Option 2"
                  value={pollOpt2}
                  onChange={(e) => setPollOpt2(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-purple-200 dark:border-purple-800 text-xs"
                />
              </div>
            </div>
          )}

          {/* Form Fields: Text & Location & Mentions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Story Caption / Text
              </label>
              <input
                type="text"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Location Tag
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-rose-500" />
                <input
                  type="text"
                  placeholder="San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Mention People Section */}
          <div ref={mentionContainerRef} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-sky-500" />
                <span>Mention Friends</span>
              </label>
              {selectedMentions.length > 0 && (
                <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                  {selectedMentions.length} {selectedMentions.length === 1 ? 'person' : 'people'} tagged
                </span>
              )}
            </div>

            {/* Selected Mention Badges/Chips */}
            {selectedMentions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-100/80 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60">
                {selectedMentions.map((mId) => {
                  const u = (users || []).find((user) => user.clerkId === mId);
                  return (
                    <span
                      key={mId}
                      className="inline-flex items-center gap-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 pl-1.5 pr-2 py-1 rounded-full text-xs font-semibold shadow-xs"
                    >
                      <Avatar src={u?.image} size="xs" />
                      <span className="text-[11px]">@{u?.username || 'user'}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveMention(mId, e)}
                        className="ml-0.5 p-0.5 rounded-full text-neutral-400 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        aria-label="Remove mention"
                      >
                        <X className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Mention Search Input & Dropdown */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <AtSign className="w-4 h-4 text-sky-500" />
              </div>
              <input
                type="text"
                placeholder="Search username or name to mention..."
                value={mentionsInput}
                onFocus={() => setIsMentionOpen(true)}
                onChange={(e) => {
                  setMentionsInput(e.target.value);
                  setIsMentionOpen(true);
                }}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {mentionsInput && (
                <button
                  type="button"
                  onClick={() => setMentionsInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {isMentionOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl overflow-hidden max-h-56 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 text-[11px] font-bold text-neutral-400 flex items-center justify-between">
                    <span>{mentionsInput.trim() ? 'Matching accounts' : 'Suggested accounts'}</span>
                    <button
                      type="button"
                      onClick={() => setIsMentionOpen(false)}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    {filteredUsers.length === 0 ? (
                      <div className="py-6 text-center text-xs text-neutral-400 space-y-1">
                        <p>No accounts found</p>
                        {mentionsInput && (
                          <p className="text-[10px] text-neutral-500">
                            No match for "{mentionsInput}"
                          </p>
                        )}
                      </div>
                    ) : (
                      filteredUsers.map((user) => {
                        const isSelected = selectedMentions.includes(user.clerkId);
                        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

                        return (
                          <div
                            key={user.clerkId}
                            onClick={() => handleToggleMention(user.clerkId)}
                            className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-sky-50/70 dark:bg-sky-950/40'
                                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/70'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <Avatar src={user.image} size="sm" />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                                  @{user.username}
                                </div>
                                {fullName && (
                                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                                    {fullName}
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleMention(user.clerkId);
                              }}
                              className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-sky-500 text-white shadow-2xs'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                              }`}
                            >
                              {isSelected ? (
                                <span className="flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Tagged
                                </span>
                              ) : (
                                <span>+ Mention</span>
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Emojis */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
              <Smile className="w-3.5 h-3.5" /> Emoji:
            </span>
            {EMOJI_PRESETS.map((emo) => (
              <button
                key={emo}
                type="button"
                onClick={() => setSelectedEmoji(selectedEmoji === emo ? null : emo)}
                className={`p-1.5 rounded-xl text-sm transition-transform hover:scale-125 ${selectedEmoji === emo ? 'bg-sky-100 dark:bg-sky-950 ring-2 ring-sky-500' : ''
                  }`}
              >
                {emo}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
              Share Story
            </Button>
          </div>
        </form>
      </Modal>

      {/* Music Selector Modal */}
      {isMusicModalOpen && (
        <MusicSelector
          onClose={() => setIsMusicModalOpen(false)}
          onSelectMusic={(mus) => setSelectedMusic(mus)}
          selectedMusic={selectedMusic}
        />
      )}
    </>
  );
};

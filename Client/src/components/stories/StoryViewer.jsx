import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  Send,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Volume2,
  VolumeX,
  Music,
  Share2,
  Bookmark,
  MoreHorizontal,
  MapPin,
  Star,
  Check,
  Flag,
  EyeOff,
  BellOff,
  Link,
  Copy,
  MessageCircle,
  Users,
  UserPlus,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Avatar } from '../common/Avatar';
import { useNavigate, useLocation } from 'react-router-dom';
import { musicService } from '../../services/musicService';

export const StoryViewer = () => {

  const { currentUser } = useAuth();

  const {
    stories,
    activeStoryUserId,
    openStoryViewer,
    closeStoryViewer,
    likeStory,
    viewStory,
    deleteStory,
    saveStory,
    showToast,
    users,
    createMessage,
    toggleFollowUser,
    createResponse,
    getResponses,
    shareStory,

  } = useData();

  const navigate = useNavigate();

  const location = useLocation();

  // Extract userId from URL if on /stories/:userId
  const match = location.pathname.match(/\/stories\/([^\/]+)/);

  const routeUserId = match ? decodeURIComponent(match[1]) : null;

  const effectiveUserId = activeStoryUserId || routeUserId;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Default muted to ensure 100% reliable browser autoplay
  const [isBuffering, setIsBuffering] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isRespondOpen, setIsRespondOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);


  const [responses, setResponses] = useState(null);
  const [resText, setResText] = useState('');


  // Poll vote local state for instant feedback
  const [userPollVote, setUserPollVote] = useState(null);

  // Reaction Hearts Animation list
  const [floatingHearts, setFloatingHearts] = useState([]);


  const videoRef = useRef(null);

  // All unique creators who have active stories
  const creatorIds = Array.from(new Set(stories.map((s) => s.userId)));

  // Filter stories for active user (matching by userId or username)
  const userStories = effectiveUserId
    ? stories.filter(
      (s) =>
        s.userId === effectiveUserId ||
        s.username.toLowerCase() === effectiveUserId.toLowerCase()
    )
    : [];

  const currentStory = userStories[currentIndex] || userStories[0];

  const currentCreatorId = currentStory?.userId || effectiveUserId;

  const currentCreatorIndex = currentCreatorId ? creatorIds.indexOf(currentCreatorId) : -1;
  const pollOptions = currentStory?.poll
    ? currentStory.poll.options?.length
      ? currentStory.poll.options
      : [currentStory.poll.option1, currentStory.poll.option2].filter(Boolean)
    : [];


  const hasPoll = Boolean(currentStory?.poll && pollOptions.length > 0);

  useEffect(() => {
    if (!currentStory?.question?.prompt || currentUser?.clerkId !== currentStory.userId) {
      setResponses(null);
      return;
    }

    let isCurrent = true;

    getResponses(currentStory._id).then((fetchedResponses) => {
      if (isCurrent) setResponses(fetchedResponses);
    });

    return () => {
      isCurrent = false;
    };
  }, [currentStory?._id, currentStory?.question?.prompt, currentStory?.userId, currentUser?.clerkId]);

  useEffect(() => {
    setCurrentIndex(0);
    setUserPollVote(null);
  }, [effectiveUserId]);

  const handleClose = () => {
    musicService.stopPreview();
    closeStoryViewer();
    if (location.pathname.startsWith('/stories/')) {
      navigate('/stories');
    }
  };

  const handleNext = () => {
    if (currentIndex < userStories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserPollVote(null);
    } else {
      // Transition to next creator if available
      if (currentCreatorIndex >= 0 && currentCreatorIndex < creatorIds.length - 1) {
        const nextCreatorId = creatorIds[currentCreatorIndex + 1];
        openStoryViewer(nextCreatorId);
        setCurrentIndex(0);
        setUserPollVote(null);
        if (location.pathname.startsWith('/stories')) {
          navigate(`/stories/${nextCreatorId}`);
        }
      } else {
        handleClose();
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setUserPollVote(null);
    } else if (currentCreatorIndex > 0) {
      // Transition to previous creator
      const prevCreatorId = creatorIds[currentCreatorIndex - 1];
      const prevCreatorStories = stories.filter((s) => s.userId === prevCreatorId);
      openStoryViewer(prevCreatorId);
      setCurrentIndex(Math.max(0, prevCreatorStories.length - 1));
      // setProgress(0);
      setUserPollVote(null);
      if (location.pathname.startsWith('/stories')) {
        navigate(`/stories/${prevCreatorId}`);
      }
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {




      if (isReplyOpen || isRespondOpen) return;

      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    if (effectiveUserId && currentStory) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [effectiveUserId, currentStory, currentIndex, currentCreatorIndex, creatorIds, isRespondOpen, isReplyOpen]);

  useEffect(() => {
    if (!currentStory || !currentUser) return;
    viewStory(currentStory._id);

    // Play music if story has music attached
    if (currentStory.music) {
      musicService.playStory(currentStory.music);
    } else {
      musicService.stopPreview();
    }

    return () => {
      musicService.stopPreview();
    };
  }, [
    currentStory?._id,
    currentStory?.music?.songId,
    currentStory?.music?.audioUrl,
    currentStory?.music?.startSec,
    currentUser?.clerkId,
  ]);

  // Initialize a new video once. Do not reset currentTime when the user
  // pauses, unmutes, or interacts with the controls.
  useEffect(() => {
    if (currentStory && currentStory.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = true;
      if (!isPaused) videoRef.current.play().catch(() => {


      });
    }
  }, [currentStory, currentIndex]);

  // Handle pause/play and mute changes without restarting the video.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || currentStory?.type !== 'video') return;

    video.muted = isMuted;
    if (isPaused) {
      video.pause();
    } else {
      video.play().catch(() => { });
    }
  }, [isPaused, isMuted, currentStory]);

  // Automatically advance image stories after five seconds.
  useEffect(() => {
    if (
      !currentStory ||
      currentStory.type === 'video' ||
      isPaused ||
      isRespondOpen ||
      showViewersModal ||
      showOptionsMenu
    ) return;

    const timeout = setTimeout(handleNext, 5000);

    return () => clearTimeout(timeout);
  }, [currentStory, currentIndex, isPaused, isRespondOpen, showViewersModal, showOptionsMenu, currentCreatorIndex, creatorIds]);

  if (!effectiveUserId || userStories.length === 0 || !currentStory) return null;

  const isLiked = currentUser ? currentStory.likes.includes(currentUser.clerkId) : false;
  const isOwner = currentUser?.clerkId === currentStory.userId;
  const isFollowing = currentUser?.following?.includes(currentStory.userId) || false;
  const isSaved = currentStory.savedBy?.includes(currentUser?.clerkId || '') || false;
  const displayedResponses = responses ?? currentStory.question?.responses ?? [];

  const triggerFloatingHeart = () => {
    const id = Date.now();
    const x = Math.random() * 60 + 20;
    setFloatingHearts((prev) => [...prev, { id, x }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1200);
  };

  const handleSendReply = async (e) => {

    e.preventDefault();
    const text = replyMessage.trim();
    const receiverId = currentStory?.userId;

    if (!text || !receiverId) return;

    const message = await createMessage(receiverId, text, currentStory._id.toString());
    if (!message) return;

    showToast(`Direct message sent to @${currentStory.username}!`);
    setReplyMessage('');
    triggerFloatingHeart();
  };

  const reactions = ['🔥', '😂', '❤️', '😮', '👏', '💯'];

  const shareOptions = [
    { id: 'copy_link', label: 'Copy story link', detail: 'Get a link to this story', icon: <Link className="w-4 h-4" /> },
    { id: 'send_message', label: 'Send in direct message', detail: 'Send the story to a friend', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'story_feed', label: 'Share to your feed', detail: 'Post this story as a new card', icon: <Share2 className="w-4 h-4" /> },
    { id: 'close_friends', label: 'Share with close friends', detail: 'Send to your close friends list', icon: <Users className="w-4 h-4" /> },
  ];

  const handleEmojiReaction = async (emoji) => {

    const receiverId = currentStory?.userId;

    if (!receiverId || !currentStory?._id) return;

    const message = await createMessage(receiverId, emoji, currentStory._id.toString());
    if (!message) return;

    showToast(`Sent ${emoji} reaction to @${currentStory.username}!`);
    setReplyMessage('');
    triggerFloatingHeart();

  };



  const handleShareStory = () => {
    setShowShareModal(true);
  };

  const handleShareOption = async (option) => {
    if (!currentStory?._id || isSharing) return;

    setIsSharing(true);
    setShowShareModal(false);

    try {
      const payload = await shareStory(currentStory._id, option.id);

      if (payload?.fallback) {
        showToast('Story is ready to share', 'success');
      } else {
        showToast(`Story shared with ${option.label}`, 'success');
      }
    } catch (e) {
      showToast('Unable to share this story', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const viewersList = users.filter((u) => currentStory.views.includes(u.id));


  // story user respond
  const handleSendRes = async () => {

    const text = resText.trim();

    if (!text || !currentStory?._id) return;

    await createResponse(currentStory._id, text);

    setResText("");

    setIsRespondOpen(false);
    setIsPaused(false);
    handleClose();
    showToast(`Response sent to @${currentStory.username}`, "success");

  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none animate-in fade-in duration-200">
      {/* Background Close Click */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Floating Hearts Animation Container */}
      <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            style={{ left: `${h.x}%` }}
            className="absolute bottom-20 text-3xl animate-bounce transition-all duration-1000 transform -translate-y-64 opacity-0"
          >
            ❤️
          </div>
        ))}
      </div>

      {/* Main Story View Container */}
      <div
        className="relative w-full max-w-sm sm:max-w-md h-[92vh] sm:h-[88vh] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 border border-neutral-800"
      >
        {/* Story Header */}
        <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              onClick={(e) => {
                e.stopPropagation();
                closeStoryViewer();
                navigate(`/profile/${currentStory.username}`);
              }}
              className="flex items-center gap-2 cursor-pointer bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full hover:bg-black/60 transition-colors shrink-0"
            >
              <Avatar src={currentStory.userAvatar} size="xs" />
              <span className="text-white text-xs font-bold truncate max-w-[90px] sm:max-w-[130px]">
                {currentStory.username}
              </span>
              <span className="text-white/60 text-[10px]">{currentStory.createdAt}</span>
            </div>

            {currentStory.isCloseFriends && (
              <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-extrabold flex items-center gap-1 shrink-0 shadow-md">
                <Star className="w-2.5 h-2.5 fill-white" /> Friends
              </span>
            )}

            {!isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFollowUser(currentStory.userId);
                }}
                className={`px-3 py-1 rounded-full font-bold text-xs transition-all backdrop-blur-md cursor-pointer shrink-0 ${isFollowing
                  ? 'bg-white/20 text-white hover:bg-white/30 border border-white/20'
                  : 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs'
                  }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {currentStory.type === 'video' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-1.5 text-white/90 hover:text-white bg-black/40 rounded-full backdrop-blur-md"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOptionsMenu(!showOptionsMenu);
              }}
              className="p-1.5 text-white/90 hover:text-white bg-black/40 rounded-full backdrop-blur-md"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={handleClose}
              className="p-1.5 text-white hover:text-neutral-300 bg-black/40 rounded-full backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Music Tag Subheader Pill */}
        {currentStory.music && (
          <div className="absolute top-16 left-3.5 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-md animate-in slide-in-from-top duration-300">
            <Music className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            <span>{currentStory.music.songTitle}</span>
            <span className="text-white/50">• {currentStory.music.artist}</span>
          </div>
        )}

        {/* Main Media (Image or Video) */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none">
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {currentStory.type === 'video' ? (
            <video
              ref={videoRef}
              key={currentStory._id + '-' + currentStory.mediaUrl}
              src={currentStory.mediaUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
              muted={isMuted}
              preload="auto"
              onEnded={() => {
                handleNext();
              }}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
              onCanPlay={() => setIsBuffering(false)}
              onError={() => {
                setIsBuffering(false);
                console.log('Video error fallback');
              }}
            />
          ) : (
            <img
              key={currentStory._id + '-' + currentStory.mediaUrl}
              src={currentStory.mediaUrl}
              alt="Story media"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback placeholder image
                e.target.src =
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
              }}
            />
          )}

          {/* Sound On/Off Indicator Badge for Videos */}
          {currentStory.type === 'video' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute bottom-28 right-4 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 hover:bg-black/80 transition-all cursor-pointer shadow-lg"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>Unmute</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Sound On</span>
                </>
              )}
            </button>
          )}



          {/* Location Tag */}
          {currentStory.location && (
            <div className="absolute top-24 left-3.5 z-20 flex items-center gap-1 bg-rose-500/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-extrabold shadow-md">
              <MapPin className="w-3 h-3" /> {currentStory.location}
            </div>
          )}




          {/* Poll: rendered only for stories that contain poll data */}
          {hasPoll && (
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 z-30 rounded-2xl border border-white/20 bg-black/65 p-4 shadow-2xl backdrop-blur-md">
              <p className="mb-3 text-center text-sm font-extrabold text-white">
                {currentStory.poll.question || 'Vote'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {pollOptions.slice(0, 2).map((option, index) => {
                  const voteKey = `opt${index + 1}`;
                  const optionText = typeof option === 'string' ? option : option.text;
                  return (
                    <button
                      key={voteKey}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserPollVote(voteKey);
                        showToast(`Voted "${optionText}"!`);
                      }}
                      className={`rounded-xl p-3 text-xs font-bold transition-all ${userPollVote === voteKey
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'bg-white/15 text-white hover:bg-white/25 border border-white/15'
                        }`}
                    >
                      {optionText}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Showing question */}
          {currentStory.question?.prompt && (
            <div className="absolute inset-x-4 top-1/2 z-30 max-h-[55%] -translate-y-1/2 overflow-hidden rounded-2xl border border-white/20 bg-black/70 shadow-2xl backdrop-blur-md">
              <div className="border-b border-white/10 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                  Question
                </p>
                <p className="mt-1 text-sm font-extrabold text-white">
                  {currentStory.question.prompt}
                </p>

                <button
                  type="button"
                  onClick={() => setIsRespondOpen(true)}
                  className="mt-3 w-full rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-600"
                >
                  Respond
                </button>

                {isRespondOpen && (
                  <div className="mt-3 space-y-2 text-left">
                    <textarea
                      rows="3"
                      placeholder="Write your response..."
                      value={resText}
                      onChange={(e) => setResText(e.target.value)}
                      onFocus={() => setIsPaused(true)}
                      className="w-full resize-none rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white placeholder-white/50 outline-none focus:border-sky-400"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsRespondOpen(false);

                          setIsPaused(false);
                        }}
                        className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={handleSendRes}
                        className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}

              </div>

              <div className="max-h-56 space-y-2 overflow-y-auto p-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-bold text-white">Responses</p>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/60">
                    {displayedResponses.length}
                  </span>
                </div>

                {displayedResponses.length ? (
                  displayedResponses.map((response, index) => (

                    <div
                      key={`${response.userId || 'response'}-${index}`}
                      className="rounded-xl border border-white/10 bg-white/10 p-3"
                    >
                      <p className="text-[11px] font-bold text-sky-200">
                        {response.userName || 'Anonymous'}
                      </p>
                      <p className="mt-1 break-words text-xs leading-relaxed text-white/90">
                        {response.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-white/50">
                    No responses yet
                  </p>
                )}
              </div>
            </div>
          )}

          {/* User Mentions */}
          {currentStory.mentions && currentStory.mentions.length > 0 && (
            <div className="absolute bottom-24 left-4 z-20 flex flex-wrap gap-2">
              {currentStory.mentions.map((mention, idx) => {
                const targetUser = (users || []).find(
                  (user) => user.clerkId === mention || user.username === mention
                );
                return (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeStoryViewer();
                      navigate(`/profile/${targetUser?.username || mention}`);
                    }}
                    className="bg-white/90 dark:bg-black/80 text-neutral-900 dark:text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md hover:scale-105 transition-transform"
                  >
                    @{targetUser?.username || mention}
                  </button>
                );
              })}
            </div>
          )}

          {/* Story Caption Overlay */}
          {currentStory.caption && (
            <div className="absolute bottom-20 inset-x-4 z-20 text-center">
              <span className="inline-block bg-black/60 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-xl">
                {currentStory.caption}
              </span>
            </div>
          )}

          {/* Tap Zones for Navigation */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8 text-white bg-black/40 rounded-full p-1" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-8 h-8 text-white bg-black/40 rounded-full p-1" />
          </button>
        </div>

        {/* Story Bottom Interactions & Reply Bar */}
        <div className="p-3 bg-neutral-900 border-t border-neutral-800 space-y-2 z-20">
          {/* Quick Reaction Emoji Row */}
          {!isOwner && (
            <div className="flex items-center justify-around px-2 py-1 bg-neutral-800/60 rounded-full text-sm">
              {reactions.map((emo) => (
                <button
                  key={emo}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEmojiReaction(emo);
                  }}
                  className="p-1 hover:scale-125 transition-transform cursor-pointer"
                >
                  {emo}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {isOwner ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowViewersModal(true);
                }}
                className="flex-1 flex items-center justify-between px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full text-xs font-bold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>Viewed by {currentStory.views.length} viewers</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-sky-400">View</span>
              </button>
            ) : (
              <form onSubmit={handleSendReply} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Send message to @${currentStory.username}...`}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onClick={() => setIsReplyOpen(true)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  className="flex-1 px-4 py-2 rounded-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 text-xs focus:outline-none focus:border-sky-500"
                />
                {replyMessage.trim() && (
                  <button type="submit" className="p-2 text-sky-500 hover:text-sky-400 font-bold">
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </form>
            )}

            {/* Like Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                likeStory(currentStory._id);
                triggerFloatingHeart();
              }}
              className="p-2 text-white hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
            </button>

            {/* Save Bookmark */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                saveStory(currentStory._id);
              }}
              className="p-2 text-white hover:scale-110 transition-transform cursor-pointer"
            >
              <Bookmark
                className={`w-6 h-6 ${isSaved ? 'fill-white text-white dark:fill-white dark:text-white' : ''
                  }`} />
            </button>

            {/* Share */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShareStory();
              }}
              className="p-2 text-white hover:scale-110 transition-transform cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[32px] border border-white/10 bg-neutral-950 p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">Share Story</div>
                <h3 className="mt-1 text-base font-black text-white">Choose a sharing option</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleShareOption(option)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition-all hover:bg-sky-500/20 hover:border-sky-400/70"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sky-300">
                    {option.icon}
                  </span>
                  <span className="flex-1">
                    <span className="block text-xs font-black text-white">{option.label}</span>
                    <span className="block text-[10px] font-medium text-neutral-400">{option.detail}</span>
                  </span>
                  <span className="rounded-full bg-white/10 p-1 text-white">
                    <Share2 className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
              <span className="text-[11px] font-bold text-neutral-400">Story from @{currentStory.username}</span>
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-full px-3 py-2 text-[11px] font-black text-white transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Options Dropdown Menu */}
      {showOptionsMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-neutral-900 border border-neutral-800 rounded-3xl p-3 space-y-1 shadow-2xl animate-in zoom-in-95 duration-150">
            {isOwner ? (
              <button
                onClick={() => {
                  deleteStory(currentStory._id);
                  setShowOptionsMenu(false);
                  closeStoryViewer();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-rose-950/50 text-rose-500 text-xs font-bold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Story</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    showToast(`Story from @${currentStory.username} hidden`);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-neutral-800 text-neutral-200 text-xs font-bold"
                >
                  <EyeOff className="w-4 h-4 text-amber-500" />
                  <span>Hide story from feed</span>
                </button>
                <button
                  onClick={() => {
                    showToast(`Muted @${currentStory.username}'s stories`);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-neutral-800 text-neutral-200 text-xs font-bold"
                >
                  <BellOff className="w-4 h-4 text-purple-400" />
                  <span>Mute @{currentStory.username}</span>
                </button>
                <button
                  onClick={() => {
                    showToast('Report submitted. Thank you.');
                    setShowOptionsMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-neutral-800 text-rose-400 text-xs font-bold"
                >
                  <Flag className="w-4 h-4" />
                  <span>Report inappropriate content</span>
                </button>
              </>
            )}
            <button
              onClick={() => {
                handleShareStory();
                setShowOptionsMenu(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-neutral-800 text-neutral-200 text-xs font-bold"
            >
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>Copy Link</span>
            </button>

            <button
              onClick={() => setShowOptionsMenu(false)}
              className="w-full py-2.5 text-center text-xs font-bold text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Viewers Activity Sheet (Owner) */}
      {showViewersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-4 max-h-[70vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h4 className="text-white text-sm font-bold">Story Insights & Viewers</h4>
              <button onClick={() => setShowViewersModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-around py-2 border-b border-neutral-800 text-center">
              <div>
                <div className="text-lg font-bold text-white">{currentStory.views.length}</div>
                <div className="text-[10px] text-neutral-400 uppercase">Total Views</div>
              </div>
              <div>
                <div className="text-lg font-bold text-rose-500">{currentStory.likes.length}</div>
                <div className="text-[10px] text-neutral-400 uppercase">Likes</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              <div className="text-xs font-semibold text-neutral-400">Viewers List</div>
              {viewersList.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-4">No views yet</p>
              ) : (
                viewersList.map((viewer) => {
                  const isViewerSelf = currentUser?.id === viewer.id;
                  const isViewerFollowing = currentUser?.following?.includes(viewer.id) || false;

                  return (
                    <div
                      key={viewer.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-800 gap-2"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar src={viewer.profileImage} size="sm" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">@{viewer.username}</div>
                          <div className="text-[10px] text-neutral-400 truncate">{viewer.fullName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {currentStory.likes.includes(viewer.id) && (
                          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                        )}
                        {!isViewerSelf && (
                          <button
                            onClick={() => toggleFollowUser(viewer.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${isViewerFollowing
                              ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                              : 'bg-sky-500 text-white hover:bg-sky-600'
                              }`}
                          >
                            {isViewerFollowing ? 'Following' : 'Follow'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Smile,
  BadgeCheck,
  Edit2,
  Trash2,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { PostCarousel } from './PostCarousel';
import { useData } from '../../context/DataCOntext.jsx';

export const PostCard = ({
  post,
  onEditClick,
  onCommentsClick,
  onLikesClick,

}) => {

  const { currentUser } = useAuth();

  const {
    comments,
    likePost,
    commentPost,
    savePost,
    deletePost,
    toggleFollowUser,
    stories,
    openStoryViewer,
    users,
    showToast,


  } = useData();


  const navigate = useNavigate();

  const [commentInput, setCommentInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const isLiked = currentUser
    ? post.likes.includes(currentUser.clerkId)
    : false;



  const isSaved = currentUser?.savedPosts?.includes(post._id) || false;

  const isOwner = currentUser?.clerkId === post.userId;

  const isFollowing = currentUser?.following?.includes(post.userId) || false;
  // const postOwnerUser = currentUser?.id === post.userId ? currentUser : null;

  // Check if post author has an active story
  const hasAuthorStory = stories.some((s) => s.userId === post.userId);

  const handleLikeToggle = () => {
    likePost(post._id);
  };


  const postComments = (comments || []).filter(
    (comment) => String(comment.postId) === String(post._id)
  );

  const postAuthor = users.find((user) => user.clerkId === post.userId);

  const postAuthorUsername = postAuthor?.username || post.username;



  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!commentInput.trim()) return;

    commentPost(post._id, commentInput.trim());
    setCommentInput('');
  };

  const handleAddEmoji = (emoji) => {
    setCommentInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const postUrl = `${window.location.origin}/post/${post._id}`;

  const copyTextToClipboard = async (text) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = text;
    tempTextArea.setAttribute('readonly', '');
    tempTextArea.style.position = 'fixed';
    tempTextArea.style.opacity = '0';
    document.body.appendChild(tempTextArea);
    tempTextArea.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(tempTextArea);

    if (!copied) {
      throw new Error('Clipboard copy command failed');
    }
  };

  const handleCopyPostLink = async () => {
    try {
      await copyTextToClipboard(postUrl);
      setIsLinkCopied(true);
      showToast('Post link copied');
      setTimeout(() => setIsLinkCopied(false), 1800);
    } catch (error) {
      console.error('Copy post link error:', error);
      showToast('Unable to copy post link', 'error');
    }
  };

  const handleNativeShare = async () => {

    if (!navigator.share) {
      await handleCopyPostLink();
      return;
    }

    try {
      const imageUrl = Array.isArray(post.images) ? post.images[0] : post.images;

      let shareData = {
        title: `${postAuthorUsername}'s post`,
        text: post.caption,
        url: postUrl,
      };

      if (imageUrl) {
        try {
          const imageResponse = await fetch(imageUrl);
          const imageBlob = await imageResponse.blob(); //blob it is an converts the downloaded image into binary file data.
          const extension = imageBlob.type.split('/')[1] || 'jpg';
          const imageFile = new File([imageBlob], `post-image.${extension}`, {
            type: imageBlob.type || 'image/jpeg',
          });

          if (navigator.canShare?.({ files: [imageFile] })) {

            shareData = { ...shareData, files: [imageFile] };
          }
        } catch (imageError) {
          // Share the post link if the image cannot be downloaded.
          console.warn('Post image could not be attached:', imageError);
        }
      }

      await navigator.share(shareData);

      setIsShareOpen(false);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share post error:', error);
      }
    }
  };

  // Format caption to highlight #hashtags
  const renderFormattedCaption = (text) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith('#') && part.length > 1) {
        return (
          <span key={i} className="text-sky-600 dark:text-sky-400 font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const emojis = ['❤️', '🔥', '👏', '🙌', '😍', '✨', '💯', '🚀'];

  return (
    <article className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl mb-6 shadow-2xs overflow-hidden transition-colors">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-3">
          <Avatar
            src={post.userAvatar}
            size="md"
            hasStory={hasAuthorStory}
            onClick={() => {
              if (hasAuthorStory) openStoryViewer(post.userId);
              navigate(`/stories/${post.userId}`);
            }}
            to={`/profile/${postAuthorUsername}`}

          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/profile/${postAuthorUsername}`}
                className="font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:opacity-80"
              >
                {postAuthorUsername}
              </Link>
              {post.isVerified && <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500/20 shrink-0" />}
              {!isOwner && (
                <>
                  <span className="text-neutral-400 text-xs font-normal">•</span>
                  <button
                    onClick={() => toggleFollowUser(post.userId)}
                    className={`text-xs font-bold transition-colors cursor-pointer ${isFollowing
                      ? 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                      : 'text-sky-500 hover:text-sky-600 dark:text-sky-400'
                      }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </div>
            {post.location && (
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                {post.location}
              </span>
            )}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {!isOwner && (
            <button
              onClick={() => toggleFollowUser(post.userId)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${isFollowing
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-2xs'
                }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          {/* More Actions Button */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* More Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-8 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl z-30 p-1.5 text-xs font-medium space-y-1 animate-in fade-in duration-150">
                {isOwner ? (
                  <>
                    {onEditClick && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onEditClick(post);
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                      >
                        <Edit2 className="w-4 h-4 text-sky-500" />
                        <span>Edit Post</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        deletePost(post._id);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Post</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      toggleFollowUser(post.userId);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                  >
                    <span>{isFollowing ? `Unfollow @${post.username}` : `Follow @${post.username}`}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleCopyPostLink();
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                >
                  <Share2 className="w-4 h-4 text-neutral-500" />
                  <span>Copy Link</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Carousel */}
      <PostCarousel images={post.images} onDoubleTapLike={handleLikeToggle} />

      {/* Action Buttons Bar */}
      <div className="relative p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLikeToggle}
              className="hover:scale-110 active:scale-90 transition-transform"
              aria-label="Like post"
            >
              <Heart
                className={`w-6 h-6 ${isLiked
                  ? 'fill-rose-500 text-rose-500 animate-in zoom-in-75 duration-150'
                  : 'text-neutral-800 dark:text-neutral-200 hover:text-neutral-500'
                  }`}
              />
            </button>

            <button
              onClick={() => onCommentsClick && onCommentsClick(post)}
              className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-500 transition-colors"
              aria-label="Comments"
            >
              <MessageCircle className="w-6 h-6 stroke-[1.75]" />
            </button>

            <button
              type="button"
              onClick={() => setIsShareOpen((prev) => !prev)}
              className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-500 transition-colors"
              aria-label="Share post"
            >
              <Send className="w-6 h-6 stroke-[1.75]" />
            </button>
          </div>

          <button
            onClick={() => savePost(post._id)}
            className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-500 transition-colors"
            aria-label="Bookmark post"
          >
            <Bookmark
              className={`w-6 h-6 ${isSaved ? 'fill-neutral-900 text-neutral-900 dark:fill-white dark:text-white' : ''
                }`}
            />
          </button>
        </div>

        {/* Likes Count */}
        <div>
          <button
            onClick={() => onLikesClick && onLikesClick(post)}
            className="font-bold text-xs text-neutral-900 dark:text-neutral-100 hover:underline"
          >
            {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
          </button>
        </div>

        {/* Caption */}
        <div className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
          <Link
            to={`/profile/${postAuthorUsername}`}
            className="font-bold mr-2 hover:opacity-80"
          >
            {postAuthorUsername}
          </Link>
          <span>{renderFormattedCaption(post.caption)}</span>
        </div>

        {/* Comments Preview */}
        {(postComments || []).length > 0 && (
          <div className="space-y-1 pt-0.5">
            {postComments.length > 0 && (
              <button
                type="button"
                onClick={() => onCommentsClick && onCommentsClick(post)}
                className="text-xs text-neutral-500 hover:underline"
              >
                {postComments.length}{" "}
                {postComments.length === 1 ? "comment" : "comments"}
              </button>
            )}

            {(postComments || []).slice(-2).map((comment) => (
              <div key={comment._id} className="text-xs flex items-center justify-between">
                <p className="truncate">
                  <span className="font-bold mr-1.5 text-neutral-900 dark:text-neutral-100">
                    {comment.username}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">{comment.message}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 pt-1">
          {post.createdAt}
        </div>

        {isShareOpen && (
          <div className="absolute right-3 top-14 z-20 w-72 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Share post
              </h3>
              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                Close
              </button>
            </div>

            <div className="mb-3 truncate rounded-xl bg-neutral-100 px-3 py-2 text-xs text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300">
              {postUrl}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyPostLink}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-xs font-bold text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                {isLinkCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {isLinkCopied ? 'Copied' : 'Copy link'}
              </button>
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex-1 rounded-xl bg-sky-500 px-3 py-2 text-xs font-bold text-white hover:bg-sky-600"
              >
                Share
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inline Comment Input Box */}
      <form
        onSubmit={handleCommentSubmit}
        className="relative border-t border-neutral-100 dark:border-neutral-800/80 px-3.5 py-2.5 flex items-center gap-3"
      >
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          <Smile className="w-5 h-5" />
        </button>

        {showEmojiPicker && (
          <div className="absolute left-3 bottom-12 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl p-2 flex gap-2 z-30 animate-in fade-in duration-150">
            {emojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => handleAddEmoji(e)}
                className="text-lg hover:scale-125 transition-transform"
              >
                {e}
              </button>
            ))}
          </div>
        )}

        <input
          type="text"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          className="flex-1 bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!commentInput.trim()}
          className="text-xs font-bold text-sky-500 hover:text-sky-600 disabled:opacity-40 disabled:hover:text-sky-500 transition-opacity"
        >
          Post
        </button>
      </form>
    </article>
  );
};

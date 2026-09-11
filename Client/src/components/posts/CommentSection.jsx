import React, { useEffect, useState } from "react";
import { Modal } from "../common/Modal";
import { Avatar } from "../common/Avatar";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { Heart, Trash2, X } from "lucide-react";

export const CommentSection = ({ post, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { comments, getComments, commentPost, deleteComment, likeComment } = useData();
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    if (!post?._id || !isOpen) return;

    getComments(post._id);
    setReplyTo(null);
    setCommentText("");
    
  }, [post?._id, isOpen]);

  
  if (!post) return null;


  const postComments = comments.filter(
    (comment) => String(comment.postId) === String(post._id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await commentPost(post._id, commentText.trim(), replyTo?._id || null);
    setCommentText("");
    setReplyTo(null);
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setCommentText("");
  };

  const renderComment = (com, isReply = false) => {
    const replies = postComments.filter(
      (reply) => String(reply.parentCommentId) === String(com._id),
    );

    return (
      <React.Fragment key={com._id}>
        <div className={`flex items-start justify-between gap-3 group ${isReply ? "ml-9" : ""}`}>
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar src={com.userAvatar} size="xs" />
            <div className="text-xs flex-1">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 mr-2">
                {com.username}
              </span>
              <span className="text-neutral-700 dark:text-neutral-300">
                {com.message}
              </span>
              <div className="flex items-center gap-3 text-[10px] text-neutral-400 mt-1">
                <span>{com.createdAt}</span>
                {!isReply && (
                  <button
                    type="button"
                    onClick={() => handleReply(com)}
                    className="hover:underline font-semibold"
                  >
                    Reply
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => likeComment(com._id)}
              className="p-1 text-neutral-400 hover:text-rose-500"
              aria-label="Like comment"
            >
              <Heart
                className={
                  com.likes?.includes(currentUser?.clerkId)
                    ? "w-3.5 h-3.5 fill-rose-500 text-rose-500"
                    : "w-3.5 h-3.5"
                }
              />
            </button>
            {currentUser?.clerkId === com.userId && (
              <button
                type="button"
                onClick={() => deleteComment(com._id)}
                className="p-1 text-neutral-400 hover:text-red-600"
                aria-label="Delete comment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        {replies.map((reply) => renderComment(reply, true))}
      </React.Fragment>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comments" maxWidth="lg">
      <div className="flex flex-col h-[60vh] max-h-[500px]">
        {/* Caption Header */}
        <div className="flex items-start gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <Avatar src={post.userAvatar} size="sm" />
          <div className="flex-1 text-xs leading-snug">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 mr-2">
              {post.username}
            </span>
            <span className="text-neutral-700 dark:text-neutral-300">
              {post.caption}
            </span>
            <span className="block text-[10px] text-neutral-400 mt-1">
              {post.createdAt}
            </span>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {postComments.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            postComments
              .filter((comment) => !comment.parentCommentId)
              .map((comment) => renderComment(comment))
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="relative pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
        >
          {replyTo && (
            <div className="absolute bottom-full left-0 right-0 mb-2 flex items-center justify-between rounded-xl bg-sky-50 dark:bg-sky-950/50 px-3 py-2 text-[10px] text-sky-700 dark:text-sky-300">
              <span>Replying to <strong>@{replyTo.username}</strong></span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="p-1 hover:text-sky-900 dark:hover:text-white"
                aria-label="Cancel reply"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <input
            type="text"
            placeholder={replyTo ? `Reply to @${replyTo.username}...` : "Add a comment..."}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors"
          >
            {replyTo ? "Reply" : "Post"}
          </button>
        </form>
      </div>
    </Modal>
  );
};

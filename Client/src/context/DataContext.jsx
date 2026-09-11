import React, { createContext, useContext, useState, useEffect } from "react";
import { postService } from "../services/postService";
import { storyService } from "../services/storyService";
import { userService } from "../services/userService";
import { useAuth } from "./AuthContext";
import { commentService } from "../services/commentService";
import { messageService } from "../services/messageService";
import { socket } from "../services/socket";
import { notificationService } from "../services/notificationService";

const DataContext = createContext(undefined);

export const DataProvider = ({ children }) => {
  const {
    userId,
    updateCurrentUserState,
    currentUser,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeStoryUserId, setActiveStoryUserId] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [toast, setToast] = useState(null);
  const [stories, setStories] = useState([]);

  // expire story
  useEffect(() => {

    const timers = stories.filter((story) =>
      story.expiresAt
    ).map((story) => {

      const remainingTime = new Date(story.expiresAt).getTime() - Date.now();

      return setTimeout(() => {

        setStories((prevStories) =>

          prevStories.filter((item) => (
            item._id !== story._id
          )),
        )
      }, Math.max(remainingTime, 0));

    }
    );

    return () => {

      timers.forEach((timer) => clearTimeout(timer));
    }
  }, [stories]);



  const showToast = (message, type = "success") => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3500);
  };

  const requireLogin = () => {
    if (!isAuthenticated) {
      showToast("Please log in first", "error");
      return false;
    }

    if (!currentUser) {
      showToast("Your profile is still loading. Please try again.", "error");
      return false;
    }

    return true;
  };

  const refreshData = async () => {
    if (authLoading || !isAuthenticated || !userId || !currentUser) {
      return;
    }

    try {
      const [fetchedPosts, fetchedStories, fetchedUsers] = await Promise.all([
        postService.getPosts(),
        storyService.getStories(),
        userService.getUsers(),
      ]);

      console.log("POSTS:", fetchedPosts);
      console.log("STORIES:", fetchedStories);
      console.log("USERS:", fetchedUsers);

      console.log("posts array:", Array.isArray(fetchedPosts));
      console.log("stories array:", Array.isArray(fetchedStories));
      console.log("users array:", Array.isArray(fetchedUsers));

      setPosts(fetchedPosts);
      setStories(fetchedStories);
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching data:", err.response?.data);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !userId || !currentUser) {
      setPosts([]);
      setStories([]);
      setUsers([]);
      return;
    }

    refreshData();
    getNotifications();
  }, [authLoading, isAuthenticated, userId, currentUser]);



  // Post Actions
  const createPost = async (postData) => {
    if (!requireLogin()) return;

    try {
      const newPost = await postService.createPost(postData);
      setPosts((prev) => [newPost, ...prev]);
      await refreshData();
      showToast("Your post has been published!");
      return newPost;
    } catch (e) {
      showToast("Failed to create post", "error");

      throw e;
    }
  };

  const updatePost = async (postId, updates) => {
    if (!requireLogin()) return;

    try {
      const updated = await postService.updatePost(postId, updates);
      setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
      showToast("Post updated");
    } catch (e) {
      showToast("Failed to update post", "error");
    }
  };

  const deletePost = async (postId) => {
    if (!requireLogin()) return;

    try {
      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      await refreshData();
      showToast("Post deleted");
    } catch (e) {
      showToast("Failed to delete post", "error");
    }
  };

  const savePost = async (postId) => {
    if (!requireLogin()) return;
    try {
      const isSaved = await postService.savePost(currentUser.clerkId, postId);

      const updatedSaved = isSaved
        ? [...(currentUser.savedPosts || []), postId]
        : (currentUser.savedPosts || []).filter((id) => id !== postId);

      const updatedUser = { ...currentUser, savedPosts: updatedSaved };
      updateCurrentUserState(updatedUser);
      showToast(isSaved ? "Post saved to bookmark" : "Post removed from saved");
    } catch (e) {
      showToast("Failed to save post", "error");
    }
  };

  const likePost = async (postId) => {
    if (!requireLogin()) return;
    const currentUserId = currentUser.clerkId;

    // Optimistic UI update: immediately toggle like state
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== postId && p.id !== postId) return p;
        const currentLikes = Array.isArray(p.likes) ? p.likes : [];
        const isLiked = currentLikes.includes(currentUserId);
        const updatedLikes = isLiked
          ? currentLikes.filter((id) => id !== currentUserId)
          : [...currentLikes, currentUserId];
        return { ...p, likes: updatedLikes };
      }),
    );

    try {
      const likedPost = await postService.likePost(currentUserId, postId);

      if (likedPost) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId || p.id === postId
              ? { ...p, ...likedPost }
              : p,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to like post:", error);
      showToast("Failed to like post", "error");

      // Rollback optimistic update on failure
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId && p.id !== postId) return p;
          const currentLikes = Array.isArray(p.likes) ? p.likes : [];
          const isLiked = currentLikes.includes(currentUserId);
          const revertedLikes = isLiked
            ? currentLikes.filter((id) => id !== currentUserId)
            : [...currentLikes, currentUserId];
          return { ...p, likes: revertedLikes };
        }),
      );
    }
  };

  const sharePost = async (postId) => {
    try {
      const count = await postService.sharePost(postId);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, sharesCount: count } : p)),
      );
      showToast("Link copied to clipboard!");
    } catch (e) {
      showToast("Share failed", "error");
    }
  };

  // comments actions
  const getComments = async (postId) => {
    try {
      const fetchedComments = await commentService.getComments(postId);

      setComments(fetchedComments);
      console.log("Fetched comments:", fetchedComments);
    } catch (error) {
      console.error(
        "Failed to fetch comments:",
        error.response?.data || error.message,
      );
    }
  };

  const commentPost = async (postId, message, parentCommentId = null) => {
    if (!requireLogin() || !message.trim()) return;

    try {
      const newComment = await commentService.createComment({
        postId,
        parentCommentId,
        message: message.trim(),
        userAvatar: currentUser.image || "",
        username: currentUser.username || currentUser.firstName || "User",
      });

      const commentWithParent = { ...newComment, parentCommentId };
      setComments((prev) => [...prev, commentWithParent]);

      showToast("Comment posted");
      return commentWithParent;
    } catch (error) {
      console.error(
        "Create comment error:",
        error.response?.data || error.message,
      );
      showToast("Failed to post comment", "error");
    }
  };

  const deleteComment = async (commentId) => {
    if (!requireLogin()) return;

    try {
      await commentService.deleteComment(commentId);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId),
      );
      showToast("Comment deleted");
    } catch (error) {
      console.error(
        "Delete comment error:",
        error.response?.data || error.message,
      );
      showToast("Failed to delete comment", "error");
    }
  };

  const likeComment = async (commentId) => {
    if (!requireLogin()) return;

    try {
      const updatedComment = await commentService.likeComment(commentId);
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId ? updatedComment : comment,
        ),
      );
      showToast("Comment like updated");
    } catch (error) {
      console.error(
        "Like comment error:",
        error.response?.data || error.message,
      );
      showToast("Failed to like comment", "error");
    }
  };


  // Story Actions
  const openStoryViewer = (userId) => {
    setActiveStoryUserId(userId);
  };

  const closeStoryViewer = () => {
    setActiveStoryUserId(null);
    setActiveStoryIndex(null);
  };

  const createStory = async (storyData) => {

    if (!requireLogin()) return;

    try {

      const newStory = await storyService.createStory(storyData);

      setStories((prev) => [newStory, ...prev]);

      showToast("Added to your story");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to create story",
        "error",
      );
      throw error;
    }
  };


  const createResponse = async (storyId, text) => {

    try {

      const newResponse = await storyService.createResponse(storyId, text);

      setStories((prev) =>
        prev.map((story) =>
          story._id === storyId
            ? {
              ...story,
              question: {
                ...story.question,
                responses: [
                  ...(story.question?.responses || []),
                  newResponse,
                ],
              },
            }
            : story
        )
      );

      showToast("Response sent successfully", "success");

    } catch (error) {

      showToast(
        error.response?.data?.message || "Failed to create response"
      );
      throw error;

    }

  }

  const getResponses = async (storyId) => {
    if (!requireLogin()) return [];

    try {
      const responses = await storyService.getResponses(storyId);

      setStories((prev) =>
        prev.map((story) =>
          story._id === storyId
            ? {
              ...story,
              question: {
                ...story.question,
                responses,
              },
            }
            : story,
        ),
      );

      return responses;
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch responses",
        "error",
      );
      return [];
    }
  };

  const likeStory = async (storyId) => {
    if (!requireLogin()) return;

    try {
      const likeStory = await storyService.likeStory(storyId);

      setStories((prev) =>
        prev.map((s) => (s._id === storyId ? likeStory : s)),
      );
    } catch (error) {
      console.error("Failed to like story:", error.response?.data || error);

      const message = error.response?.data.message;

      alert(message);
    }
  };

  const viewStory = async (storyId) => {
    if (!requireLogin()) return;

    try {
      const updated = await storyService.viewStory(storyId);
      setStories((prev) => prev.map((s) => (s._id === storyId ? updated : s)));
    } catch (e) {
      console.error(e);
    }
  };



  const deleteStory = async (storyId) => {
    if (!requireLogin()) return;

    try {
      await storyService.deleteStory(storyId);
      setStories((prev) => prev.filter((s) => s._id !== storyId));
      showToast("Story deleted");
    } catch (e) {
      showToast("Failed to delete story", "error");
    }
  };


  const saveStory = async (storyId) => {
    if (!requireLogin()) return;
    try {
      const isSaved = await storyService.saveStory(storyId, currentUser.clerkId);

      const updatedSaved = isSaved
        ? [...(currentUser.savedStories || []), storyId]
        : (currentUser.savedStories || []).filter((id) => id !== storyId);

      const updatedUser = { ...currentUser, savedStories: updatedSaved };

      updateCurrentUserState(updatedUser);

      showToast(isSaved ? "Story saved to bookmark" : "Story removed from saved");
    } catch (error) {

      showToast("Failed to save story");

      console.error("Error :", error.message);
    }
  };

  const shareStory = async (storyId, option = 'copy_link') => {
    if (!requireLogin()) return null;

    try {
      const sharePayload = await storyService.shareStory(storyId, option);

      setStories((prev) =>
        prev.map((story) =>
          story._id === storyId
            ? {
                ...story,
                shares: Array.isArray(story.shares) ? story.shares : [],
              }
            : story,
        ),
      );

      const friendlyName = {
        copy_link: 'Copy link',
        send_message: 'Direct message',
        story_feed: 'Feed',
        close_friends: 'Close friends',
      }[option] || 'story';

      showToast(`Story shared with ${friendlyName}`);
      return sharePayload;
    } catch (error) {
      showToast("Failed to share story", "error");
      console.error("Error sharing story:", error);
      return null;
    }
  };




  // socket - io
  useEffect(() => {
    if (!currentUser?.clerkId) return;

    socket.auth = { userId: currentUser.clerkId };
    socket.connect();

    const handleIncomingMessage = (message) => {
      setMessages((previous) =>
        previous.some((item) => item._id === message._id)
          ? previous
          : [...previous, message],
      );
    };

    socket.on("receive_message", handleIncomingMessage);

    const handleIncomingNotification = (notification) => {
      setNotifications((previous) =>
        previous.some((item) => item._id === notification._id)
          ? previous
          : [notification, ...previous],
      );
    };

    socket.on("receive_notification", handleIncomingNotification);

    return () => {
      socket.off("receive_message", handleIncomingMessage);
      socket.off("receive_notification", handleIncomingNotification);
      socket.disconnect();
    };
  }, [currentUser?.clerkId]);


  // Message actions
  const getConversation = async (otherUserId) => {
    if (!requireLogin() || !otherUserId) return [];

    try {
      const fetchedMessages = await messageService.getConversation(otherUserId);
      setMessages((previous) => {

        const fetchedIds = new Set(fetchedMessages.map((message) => message._id));

        const messagesAddedWhileLoading = previous.filter(
          (message) => !fetchedIds.has(message._id),
        );

        // set the order of messages
        return [...fetchedMessages, ...messagesAddedWhileLoading].sort(
          (first, second) =>
            new Date(first.createdAt || 0) - new Date(second.createdAt || 0),
        );
      });
      return fetchedMessages;
    } catch (error) {
      console.error(
        "Failed to fetch conversation:",
        error.response?.data || error.message,
      );
      return [];
    }
  };

  const createMessage = async (receiverId, text, storyId = null, reaction = text) => {

    if (!requireLogin() || !receiverId || !text?.trim()) return null;

    try {
      const newMessage = await messageService.createMessage(receiverId, text, storyId, reaction);
      setMessages((previous) => [...previous, newMessage]);
      socket.emit("send_message", newMessage);
      return newMessage;
    } catch (error) {
      console.error("Failed to send message:", error.response?.data || error.message);
      showToast("Failed to send message", "error");

      const message = error.response?.data.message;

      showToast(message, "error");

      return null;
    }
  };



  // notification action
  const createNotification = async (receiverId, notificationData) => {

    if (!requireLogin() || !receiverId) return null;

    try {
      const newNotification = await notificationService.createNotification(receiverId, notificationData);


      setNotifications((previous) => [...previous, newNotification]);

      return newNotification;

    } catch (error) {
      console.error("Failed to send notification:", error.response?.data || error.message);
      showToast("Failed to sent notification", "error");
      return null;
    }
  };

  const getNotifications = async () => {
    try {
      const fetchedNotifications = await notificationService.getNotifications();
      const seenFollowSenders = new Set();

      const uniqueNotifications = (fetchedNotifications || []).filter((notification) => {
        if (notification.type !== "follow") return true;

        if (seenFollowSenders.has(notification.senderId)) return false;

        seenFollowSenders.add(notification.senderId);
        return true;
      });

      setNotifications(uniqueNotifications);
      return uniqueNotifications;
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error.response?.data || error.message,
      );
      return [];
    }
  };




  // User Actions
  const toggleFollowUser = async (targetUserId) => {
    if (!requireLogin()) return;

    console.log("========== FOLLOW DEBUG ==========");
    console.log("CURRENT USER:", currentUser.clerkId);
    console.log("TARGET USER:", targetUserId);
    console.log("CURRENT FOLLOWING:", currentUser.following);

    const isFollowing = (currentUser.following || []).includes(targetUserId);

    console.log("IS FOLLOWING:", isFollowing);

    try {
      if (isFollowing) {
        const { currentUser: updatedSelf, targetUser: updatedTarget } =
          await userService.unfollowUser(currentUser.clerkId, targetUserId);

        updateCurrentUserState(updatedSelf);

        setUsers((prev) =>
          prev.map((u) =>
            u.clerkId === targetUserId
              ? updatedTarget
              : u.clerkId === currentUser.clerkId
                ? updatedSelf
                : u,
          ),
        );

        showToast(`Unfollowed @${updatedTarget.username}`);
      } else {
        const { currentUser: updatedSelf, targetUser: updatedTarget } =
          await userService.followUser(currentUser.clerkId, targetUserId);

        updateCurrentUserState(updatedSelf);

        setUsers((prev) =>
          prev.map((u) =>
            u.clerkId === targetUserId
              ? updatedTarget
              : u.clerkId === currentUser.clerkId
                ? updatedSelf
                : u,
          ),
        );

        showToast(`Following @${updatedTarget.username}`);
      }
    } catch (e) {
      console.error("FOLLOW TOGGLE ERROR:", e.response.data.message);
      // showToast("You cannot follow yourself", "error");
      showToast("Action Failed", "error");
    }
  };

  const updateUserProfile = async (updates) => {
    if (!requireLogin()) return;

    try {
      const updated = await userService.updateUser(userId, updates);
      updateCurrentUserState(updated);
      setUsers((prev) => prev.map((u) => (u.clerkId === userId ? updated : u)));
      showToast("Profile updated successfully!", "success");
    } catch (e) {
      showToast("Failed to update profile", "error");
    }
  };

  return (
    <DataContext.Provider
      value={{
        currentUser,
        posts,
        stories,
        users,
        showToast,
        refreshData,
        likePost,
        savePost,
        sharePost,
        comments,
        getComments,
        commentPost,
        deleteComment,
        likeComment,
        createPost,
        updatePost,
        deletePost,
        openStoryViewer,
        closeStoryViewer,
        createStory,
        createResponse,
        getResponses,
        likeStory,
        viewStory,
        deleteStory,
        saveStory,
        shareStory,
        messages,
        notifications,
        getConversation,
        createMessage,
        getNotifications,
        updateUserProfile,
        toggleFollowUser,
        toast,
        createNotification
      }}
    >



      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

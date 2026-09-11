import Comment from "../models/commentSchema.js";
import Post from "../models/postSchema.js";
import User from "../models/userSchema.js";
import createNotification from "../services/notificationService.js";

const createComment = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;
    const { postId, message, userAvatar, username, parentCommentId } = req.body;

    if (!clerkUserId || !postId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "postId and message are required",
      });
    }

    const newComment = await Comment.create({
      postId,
      parentCommentId: parentCommentId || null,
      message: message.trim(),
      userId: clerkUserId,
      userAvatar: userAvatar || "",
      username: username || "User",
    });

    const post = await Post.findById(postId);
    const sender = await User.findOne({ clerkId: clerkUserId });
    const receiver = post ? await User.findOne({ clerkId: post.userId }) : null;

    if (post && sender && receiver && post.userId !== clerkUserId) {
      await createNotification({
        userId: post.userId,
        userAvatar: receiver.image || "",
        senderId: clerkUserId,
        senderUsername: sender.username || "User",
        senderAvatar: sender.image || "",
        type: "comment",
        message: `${sender.username || "Someone"} commented on your post`,
        postId: post._id.toString(),
        postImage: post.images?.[0] || "",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Comment not created",
    });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      postId: req.params.postId,
    });

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Comments not found",
    });
  }
};

const getComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Comment not found",
    });
  }
};

const updateComment = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.userId !== clerkUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comment",
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      {
        message: req.body.message?.trim(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Comment not updated",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.userId !== clerkUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comment",
      });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Comment not deleted",
    });
  }
};

const likeComment = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.likes.includes(clerkUserId)) {
      comment.likes = comment.likes.filter((id) => id !== clerkUserId);
    } else {
      comment.likes.push(clerkUserId);
    }

    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Comment like updated",
      data: comment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to like comment",
    });
  }
};

export {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
  likeComment,
};

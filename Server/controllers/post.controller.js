import Post from "../models/postSchema.js";
import Comment from "../models/commentSchema.js";
import User from "../models/userSchema.js";
import createNotification from "../services/notificationService.js";

const createPost = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    const { userAvatar, username, images, caption, location } = req.body;

    if (
      !images ||
      images.length === 0 ||
      !caption?.trim() ||
      !location?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Images, caption, and location are required",
      });
    }

    const newPost = await Post.create({
      userId: clerkUserId,
      userAvatar: userAvatar || "",
      username: username || "",
      images,
      caption: caption.trim(),
      location: location.trim(),
    });

    return res.status(201).json({
      success: true,
      data: newPost,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Post not created",
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    const postsWithCommentCounts = await Promise.all(
      posts.map(async (post) => ({
        ...post.toObject(),
        commentsCount: await Comment.countDocuments({
          postId: post._id.toString(),
        }),
      })),
    );

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      data: postsWithCommentCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Posts not found",
    });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Post not found",
    });
  }
};
const updatePost = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.userId !== clerkUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own posts",
      });
    }

    const updates = {};

    if (typeof req.body.caption === "string") {
      updates.caption = req.body.caption.trim();
    }

    if (typeof req.body.location === "string") {
      updates.location = req.body.location.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Caption or location is required",
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedPost) {
      return res.status(400).json({
        success: false,
        message: "Post not updated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deletePost = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.userId !== clerkUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      data: deletedPost,
    });
  } catch (error) {
    console.error("Delete Post Error:", error);

    res.status(500).json({
      success: false,
      message: "Post not deleted",
    });
  }
};

// liked post
const likePost = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    //already liked
    const isRemovingLike = post.likes.includes(clerkUserId);

    if (isRemovingLike) {
      post.likes = post.likes.filter((id) => id !== clerkUserId);
    } else {
      post.likes.push(clerkUserId);
    }
    await post.save();

    // create like notify
    if (!isRemovingLike && post.userId !== clerkUserId) {
      const [sender, receiver] = await Promise.all([
        User.findOne({ clerkId: clerkUserId }),
        User.findOne({ clerkId: post.userId }),
      ]);

      if (sender && receiver) {
        await createNotification({
          userId: post.userId,
          userAvatar: receiver.image || "",
          senderId: clerkUserId,
          senderUsername: sender.username || "User",
          senderAvatar: sender.image || "",
          type: "like_post",
          message: `${sender.username || "Someone"} liked your post`,
          postId: post._id.toString(),
          postImage: post.images?.[0] || "",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Post like updated",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const savePost = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const isSaved = post.savedBy.includes(clerkUserId);

    if (isSaved) {
      post.savedBy = post.savedBy.filter((id) => id !== clerkUserId);
    } else {
      post.savedBy.push(clerkUserId);
    }

    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter(
        (id) => id !== post._id.toString(),
      );
    } else if (!user.savedPosts.includes(post._id.toString())) {
      user.savedPosts.push(post._id.toString());
    }

    await post.save();
    await user.save();

    return res.status(200).json({
      success: true,
      message: isSaved ? "Post unsaved" : "Post saved",
      data: post,
      isSaved: !isSaved,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to save post",
    });
  }
};

const sharePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { sharesCount: 1 } },
      { new: true },
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post shared successfully",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Post not shared",
    });
  }
};

export {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  savePost,
  sharePost,
};

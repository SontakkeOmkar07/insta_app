import User from "../models/userSchema.js";
import createNotification from "../services/notificationService.js";
import { syncClerkUserById } from "../services/clerkUserSync.js";

const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Users not found",
    });
  }
};

const getUser = async (req, res) => {
  try {
    let user = await User.findOne({
      clerkId: req.params.id,
    });

    if (!user && req.params.id === req.clerkUserId) {
      try {
        user = await syncClerkUserById(req.params.id);
      } catch (syncError) {
        console.error("Failed to sync Clerk user to MongoDB:", syncError.message);
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User not found",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    if (req.params.id !== clerkUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile",
      });
    }

    const { firstName, lastName, username, image } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: clerkUserId },
      {
        firstName,
        lastName,
        username,
        image,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      success: false,
      message: "User not updated",
    });
  }
};

const followUser = async (req, res) => {
  try {
    const currentUserId = req.clerkUserId;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const currentUser = await User.findOne({
      clerkId: currentUserId,
    });

    const targetUser = await User.findOne({
      clerkId: targetUserId,
    });

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Already following this user",
      });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    await createNotification({
      userId: targetUser.clerkId,
      userAvatar: targetUser.image || "",
      senderId: currentUser.clerkId,
      senderUsername: currentUser.username || "",
      senderAvatar: currentUser.image || "",
      type: "follow",
      message: `${currentUser.username || "Someone"} started following you`,
    });


    return res.status(200).json({
      success: true,
      message: "User followed successfully",
      data: {
        currentUser,
        targetUser,
      },
    });
  } catch (error) {
    console.error("Follow user error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to follow user",
    });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.clerkUserId;
    const targetUserId = req.params.id;

    const currentUser = await User.findOne({
      clerkId: currentUserId,
    });

    const targetUser = await User.findOne({
      clerkId: targetUserId,
    });

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id !== targetUserId
    );

    targetUser.followers = targetUser.followers.filter(
      (id) => id !== currentUserId
    );

    await currentUser.save();
    await targetUser.save();


    

    return res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
      data: {
        currentUser,
        targetUser,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to unfollow user",
    });
  }
};

export {
  getUsers,
  getUser,
  updateUser,
  followUser,
  unfollowUser,
};

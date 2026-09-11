import Story from "../models/storySchema.js";
import User from "../models/userSchema.js";
import createNotification from "../services/notificationService.js";

const createStory = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    const user = await User.findOne({ clerkId: clerkUserId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      mediaUrl,
      type,
      caption,
      location,
      isLive,
      isCloseFriends,
      music,
      poll,
      question,
      category,
      mentions = [],
    } = req.body;

    const newStory = await Story.create({
      mediaUrl,
      type,
      caption,
      location,
      isLive,
      isCloseFriends,
      music,
      poll,
      question,
      category,
      mentions,
      userId: clerkUserId,
      username: user.username || user.firstName || "User",
      userAvatar: user.image || "",

      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // mentioned users story.
    for (const mentionedUserId of mentions || []) {
      if (mentionedUserId === clerkUserId) continue;

      const mentionUser = await User.findOne({ clerkId: mentionedUserId });

      if (!mentionUser) continue;

      const canMention = user.following.includes(mentionUser.clerkId);

      if (!canMention) continue;

      await createNotification({
        userId: mentionUser.clerkId,
        userAvatar: mentionUser?.image,
        senderId: clerkUserId,
        senderUsername: user.username,
        senderAvatar: user.image,
        type: "mention_story",
        message: `${user.username} mentioned you in their story`,
        storyId: newStory._id.toString(),
        storyImage: newStory.mediaUrl,
        storyType: newStory.type,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Story created successfully",
      data: newStory,
    });
  } catch (error) {
    console.error("Create story error:", error);

    return res.status(500).json({
      success: false,
      message: "Story not created",
    });
  }
};

const createResponse = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Response text is required",
      });
    }

    const user = await User.findOne({ clerkId: clerkUserId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    if (!story.question?.prompt) {
      return res.status(404).json({
        success: false,
        message: "Question prompt not found",
      });
    }

    if (clerkUserId === story.userId) {
      return res.status(400).json({
        success: false,
        message: "You can't respond to your own question.",
      });
    }

    const alreadyResponded = story.question.responses.some(
      (res) => res.userId === clerkUserId,
    );

    if (alreadyResponded) {
      return res.status(400).json({
        success: false,
        message: "You already responded",
      });
    }

    const newResponse = {
      userId: clerkUserId,
      userName: user.username || user.firstName || "User",
      text: text.trim(),
    };

    story.question.responses.push(newResponse);

    await story.save();

    return res.status(201).json({
      success: true,
      message: "Response created successfully",
      data: newResponse,
    });
  } catch (error) {
    console.error("Create response error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create response",
    });
  }
};

const getResponses = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).select("userId question");

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    if (story.userId !== req.clerkUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only view responses to your own story",
      });
    }

    return res.status(200).json({
      success: true,
      data: story.question?.responses || [],
    });
  } catch (error) {
    console.error("Get responses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch responses",
    });
  }
};

const uploadStoryMedia = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Media file is required",
    });
  }

  return res.status(201).json({
    success: true,
    url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
    type: req.file.mimetype.startsWith("video/") ? "video" : "image",
  });
};

const getStories = async (req, res) => {
  try {
    const stories = await Story.find({
      expiresAt: { $gt: new Date() },
    });

    return res.status(200).json({
      success: true,
      data: stories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Stories not found",
    });
  }
};

const getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    if (!story || !story.expireAt <= new Date()) {
      return res.status(404).json({
        success: false,
        message: "Story expired",
      });
    }

    return res.status(200).json({
      success: true,
      data: story,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Story not found",
    });
  }
};

const updateStory = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    if (story.userId !== clerkUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own story",
      });
    }

    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      {
        caption: req.body.caption,
        location: req.body.location,
        isLive: req.body.isLive,
        isCloseFriends: req.body.isCloseFriends,
        music: req.body.music,
        poll: req.body.poll,
        question: req.body.question,
        category: req.body.category,
        mentions: req.body.mentions,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Story updated successfully",
      data: updatedStory,
    });
  } catch (error) {
    console.error("Update story error:", error);

    return res.status(500).json({
      success: false,
      message: "Story not updated",
    });
  }
};

const deleteStory = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    if (story.userId !== clerkUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own story",
      });
    }

    await Story.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Story not deleted",
    });
  }
};

const likeStory = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    if (clerkUserId === story.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot like your own story",
      });
    }

    //create like notify
    const isRemovingLike = story.likes.includes(clerkUserId);

    if (isRemovingLike) {
      story.likes = story.likes.filter((id) => id !== clerkUserId);
    } else {
      story.likes.push(clerkUserId);
    }

    await story.save();

    if (!isRemovingLike) {
      const [sender, receiver] = await Promise.all([
        User.findOne({ clerkId: clerkUserId }),
        User.findOne({ clerkId: story.userId }),
      ]);

      if (sender && receiver && story.userId !== clerkUserId) {
        await createNotification({
          userId: story.userId,
          userAvatar: receiver.image || "",
          senderId: clerkUserId,
          senderUsername: sender.username || "User",
          senderAvatar: sender.image || "",
          type: "like_story",
          message: `${sender.username || "Someone"} liked your story`,
          storyId: story._id.toString(),
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Story like updated",
      data: story,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const viewStory = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    if (!story.views.includes(clerkUserId)) {
      story.views.push(clerkUserId);
    }
    await story.save();

    return res.status(200).json({
      success: true,
      message: "Story viewed",
      data: story,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to view story",
    });
  }
};

const saveStory = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }
    const isSaved = story.savedBy.includes(clerkUserId);

    const user = await User.findOne({ clerkId: clerkUserId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (isSaved) {
      story.savedBy = story.savedBy.filter((id) => id !== clerkUserId);
    } else {
      story.savedBy.push(clerkUserId);
    }

    await user.save();
    await story.save();

    return res.status(200).json({
      success: true,
      message: isSaved ? "Story unsaved" : "Story saved",
      data: story,
      isSaved: !isSaved,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to save story",
    });
  }
};

const shareStory = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    const allowedShareTypes = {
      copy_link: "Copy link",
      send_message: "Direct message",
      story_feed: "Feed",
      close_friends: "Close friends",
    };

    const shareType = String(req.body?.shareType || "copy_link");

    if (!allowedShareTypes[shareType]) {
      return res.status(400).json({
        success: false,
        message: "Unsupported story share option",
      });
    }

    const sharer = await User.findOne({ clerkId: clerkUserId });

    if (!sharer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const storyUrl = `${req.protocol}://${req.get("host")}/stories/${story._id}`;

    await createNotification({
      userId: story.userId,
      userAvatar: story.userAvatar || "",
      senderId: clerkUserId,
      senderUsername: sharer.username || sharer.firstName || "User",
      senderAvatar: sharer.image || "",
      type: "story_share",
      message: `${sharer.username || "Someone"} shared your story via ${allowedShareTypes[shareType]}`,
      storyId: story._id.toString(),
      storyImage: story.mediaUrl,
      storyType: story.type,
    });

    return res.status(200).json({
      success: true,
      message: `Story shared with ${allowedShareTypes[shareType]}`,
      data: {
        storyId: story._id,
        shareType,
        shareLabel: allowedShareTypes[shareType],
        sharedBy: clerkUserId,
        storyUrl,
        sharedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Share story error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to share story",
    });
  }
};

const votePoll = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;
    const { option } = req.body;

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    if (!story.poll || !story.poll.options[option]) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll option",
      });
    }

    const selectedOption = story.poll.options[option];

    if (selectedOption.votes.includes(clerkUserId)) {
      selectedOption.votes = selectedOption.votes.filter(
        (id) => id !== clerkUserId,
      );
    } else {
      story.poll.options.forEach((pollOption) => {
        pollOption.votes = pollOption.votes.filter((id) => id !== clerkUserId);
      });

      selectedOption.votes.push(clerkUserId);
    }

    await story.save();

    return res.status(200).json({
      success: true,
      message: "Poll vote updated",
      data: story,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to vote in poll",
    });
  }
};

export {
  createStory,
  uploadStoryMedia,
  getStories,
  getStory,
  updateStory,
  deleteStory,
  likeStory,
  viewStory,
  saveStory,
  shareStory,
  votePoll,
  createResponse,
  getResponses,
};

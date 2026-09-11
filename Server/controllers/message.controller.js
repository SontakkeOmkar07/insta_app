import Message from "../models/messageSchema.js";
import Story from "../models/storySchema.js";
import User from "../models/userSchema.js";
import createNotification from "../services/notificationService.js";

const getConversation = async (req, res) => {
  try {
    const currentUserId = req.clerkUserId;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    }).sort({ createdAt: 1 });


    // get the message stories when not null story ids use - filter(Boolean)
    const storyIds = messages.map((message) => message.storyId).filter(Boolean);

    const stories = await Story.find({ _id: { $in: storyIds } }).lean();

    const storiesById = new Map(stories.map((story) => [String(story._id), story]));

    const data = messages.map((message) => {

      const value = message.toObject();
      
      if (!value.storyPreview?.mediaUrl && value.storyId) {

        const story = storiesById.get(String(value.storyId));

        if (story) {
          value.storyPreview = {
            mediaUrl: story.mediaUrl,
            type: story.type,
            username: story.username,
            caption: story.caption,
          };
        }
      }
      return value;
    });
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ success: false, message: "Messages not found" });
  }
};

const createMessage = async (req, res) => {
  try {
    const senderId = req.clerkUserId;

    const { receiverId, text, storyId = null, reaction } = req.body;

    if (!senderId || !receiverId || !text?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "receiverId and text are required" });
    }

    let story = null;

    if (storyId) {
      story = await Story.findById(storyId);

      if (!story) {
        return res.status(404).json({
          success: false,
          message: "Story not found",
        });
      }
    }

    // cant user own story replied
    if (story && story.userId === senderId) {
      return res.status(403).json({
        success: false,
        message: "You can only reply to another user's story",
      });
    }

    if (story && receiverId !== story.userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid story receiver",
      });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text: text.trim(),
      storyId,
      reaction,
      storyPreview: story
        ? {
            mediaUrl: story.mediaUrl,
            type: story.type,
            username: story.username,
            caption: story.caption,
          }
        : undefined,
    });

    // create message notify
    const [sender, receiver] = await Promise.all([
      User.findOne({ clerkId: senderId }),
      User.findOne({ clerkId: receiverId }),
    ]);

    if (sender && receiver) {
      const notification = await createNotification({
        userId: receiverId,
        userAvatar: receiver.image || "",
        senderId,
        senderUsername: sender.username || "User",
        senderAvatar: sender.image || "",
        type: "message",
        message: storyId
          ? `${sender.username || "Someone"} replied to your story`
          : `${sender.username || "Someone"} sent you a message`,
        reaction: "",
        messageId: message._id.toString(),
        storyId,
        storyImage: story?.mediaUrl || "",
        storyType: story?.type || null,
      });

      // sending the notification when the receiver user connected.
      req.app
        .get("io")
        ?.to(`user:${receiverId}`)
        .emit("receive_notification", notification);
    }

    res.status(201).json({ success: true, data: message.toObject() });
  } catch (error) {
    console.error("Create message error:", error);

    res.status(500).json({ success: false, message: "Message not sent" });
  }
};

export { getConversation, createMessage };

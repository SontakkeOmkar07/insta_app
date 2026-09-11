import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: "",
    },

    senderId: {
      type: String,
      required: true,
    },

    senderUsername: {
      type: String,
      default: "",
    },

    senderAvatar: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      required: true,
      enum: [
        "message",
        "like_post",
        "like_story",
        "follow",
        "mention_story",
        "comment",
       
      ],
    },

    message: {
      type: String,
      required: true,
    },

    reaction: {
      type: String,
      default: "",
    },

    messageId: {
      type: String,
      default: null,
    },

    postId: {
      type: String,
      default: null,
    },

    storyId: {
      type: String,
      default: null,
    },

    storyImage: {
      type: String,
      default: "",
    },

    storyType: {
      type: String,
      enum: ["image", "video", null],
      default: null,
    },

    postImage: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Notification = model("Notification", notificationSchema);

export default Notification;

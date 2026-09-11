import Notification from "../models/notificationSchema.js";

const createNotification = async ({
  userId,
  userAvatar,
  senderId,
  senderUsername = "",
  senderAvatar = "",
  type,
  message,
  reaction,
  messageId = null,
  postId = null,
  storyId = null,
  storyImage = "",
  storyType,
  postImage = "",
}) => {


  return await Notification.create({
    userId,
    userAvatar,
    senderId,
    senderUsername,
    senderAvatar,
    type,
    message,
    reaction,
    messageId,
    postId,
    storyId,
    storyImage,
    storyType,
    postImage,
    isRead: false,
  });
};

export default createNotification;

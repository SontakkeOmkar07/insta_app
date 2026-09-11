import Notification from "../models/notificationSchema.js";

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.clerkUserId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to get notifications",
    });
  }
};


export { getNotifications };

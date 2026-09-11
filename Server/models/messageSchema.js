import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    storyId: {
      type: String,
      default: null,
    },
    storyPreview: {
      mediaUrl: { type: String, default: "" },
      type: { type: String, enum: ["image", "video", null], default: null },
      username: { type: String, default: "" },
      caption: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: 1 });

const Message = model("Message", messageSchema);

export default Message;

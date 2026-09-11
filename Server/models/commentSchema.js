import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    postId: {
      type: String,
      required: true,
    },
    parentCommentId: {
      type: String,
      default: null,
    },
    userId: {
      type: String,
      required: true,
    },
     username: {
      type: String,
      default: "User",
      trim: true,
    },

    userAvatar: {
      type: String,
      required: true,
    },
   
    message: {
      type: String,
      required: true,
      trim:true,
    },
    likes: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);

const Comment = model("Comment", commentSchema);

export default Comment;

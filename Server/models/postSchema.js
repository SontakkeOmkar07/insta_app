import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      required: true,
    },
    username: {                    
      type: String,
      default: "",
    },
    images: [{ type: String, required: true }],

    caption: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    likes: { type: [String], default: [] },
    
    sharesCount: {
      type: Number,
      required: true,
      default: 0,
    },
    savedBy: {
  type: [String],
  default: [],
},
  },
  {
    timestamps: true,
  },
);

const Post = model("Post", postSchema);

export default Post;

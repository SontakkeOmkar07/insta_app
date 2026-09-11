import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const userSchema = Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
    },

    lastName: {
      type: String,
    },
    username: { type: String, unique: true, sparse: true },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    image: {
      type: String,
    },

    following: {
      type: [String],
      default: [],
    },

    followers: {
      type: [String],
      default: [],
    },
    savedPosts: { type: [String], default: [] },
    savedSongs: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);

const User = model("User", userSchema);

export default User;

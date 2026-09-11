import { Schema, model } from "mongoose";

const songSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    albumArt: { type: String, default: "" },
    audioUrl: { type: String, default: null },
    duration: { type: String, required: true, trim: true },
    isTrending: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    category: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const Song = model("Song", songSchema);

export default Song;

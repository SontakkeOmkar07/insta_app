import { Schema, model } from "mongoose";

const storySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    username: { type: String, default: "" },

    userAvatar: {
      type: String,
      required: true,
    },
    mediaUrl: { type: String, required: true },
    
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    isLive: {
      type: Boolean,
      default: false,
    },

    isCloseFriends: {
      type: Boolean,
      default: false,
    },
    music: {
      songId: {
        type: String,
      },
      songTitle: {
        type: String,
      },
      artist: {
        type: String,
      },
      albumArt: {
        type: String,
      },
      audioUrl: {
        type: String,
      },
      startSec: {
        type: Number,
        default: 0,
      },
    },

    poll: {
      question: {
        type: String,
      },
      options: [
        {
          text: {
            type: String,
            required: true,
          },
          votes: {
            type: [String],
            default: [],
          },
        },
      ],
    },

    question: {
      
      prompt: {
        type: String,
      },

      responses: [
        {
          userId: {
            type: String,
          },
          userName: {
            type: String,
          },
          text: {
            type: String,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    category: {
      type: String,
      default: "Recommended",
    },
    mentions: {
      type: [String],
      default: [],
    },

    likes: {
      type: [String],
      default: [],
    },

    views: {
      type: [String],
      default: [],
    },

    storyImage: {
      type: String,
      default: "",
    },
    savedBy: {
      type: [String],
      default: [],
    },
    sharesStory: {
      type: [String],
      default: [],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Story = model("Story", storySchema);

export default Story;

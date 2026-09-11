import express from "express";

import {
  createStory,
  getStories,
  getStory,
  updateStory,
  deleteStory,
  likeStory,
  viewStory,
  saveStory,
  shareStory,
  votePoll,
  uploadStoryMedia,
  createResponse,
  getResponses,
} from "../controllers/story.controller.js";

import { handleStoryUpload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/", createStory);
router.post("/upload", handleStoryUpload, uploadStoryMedia);
router.get("/", getStories);
router.get("/:id/responses", getResponses);
router.get("/:id", getStory);
router.patch("/:id", updateStory);
router.delete("/:id", deleteStory);
router.post("/:id/like", likeStory);
router.post("/:id/view", viewStory);
router.post("/:id/vote", votePoll);
router.post("/:id/save", saveStory);
router.post("/:id/share", shareStory);
router.post("/:id/responses", createResponse);

export default router;

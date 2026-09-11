import express from "express";
import {
  createComment,
  deleteComment,
  getComment,
  getComments,
  likeComment,
  updateComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/", createComment);
router.get("/post/:postId", getComments);
router.get("/:commentId", getComment);
router.patch("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);
router.post("/:commentId/like", likeComment);

export default router
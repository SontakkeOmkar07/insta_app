import express from "express";
import {  createPost,savePost, deletePost, getPost, getPosts, likePost, updatePost, sharePost } from "../controllers/post.controller.js";

const router = express.Router();

// perform post crud operation
router.post("/", createPost);
router.get("/", getPosts);
router.get("/:id", getPost);
router.patch("/:id", updatePost);
router.delete("/:id", deletePost);


// other post operations
router.post("/:id/like", likePost);
router.post("/:id/save", savePost);
router.post("/:id/share", sharePost);
export default router;

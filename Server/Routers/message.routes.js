import express from "express";
import { createMessage, getConversation } from "../controllers/message.controller.js";

const router = express.Router();
router.get("/:userId", getConversation);
router.post("/", createMessage);

export default router;

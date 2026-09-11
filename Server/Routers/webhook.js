import express from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import { upsertClerkUser } from "../services/clerkUserSync.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const evt = await verifyWebhook(req, {
        
        signingSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
      });

      const { type, data: user } = evt;

      if (type === "user.created" || type === "user.updated") {

        await upsertClerkUser(user);

      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Webhook verification failed:", error.message);
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }
  },
);

export default router;

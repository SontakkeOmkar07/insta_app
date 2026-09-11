import express from "express";
import dotenv from "dotenv";
import webhookRouter from "./Routers/webhook.js";
import postRouter from "./Routers/post.routes.js";
import commentRouter from "./Routers/comment.routes.js";
import storyRouter from "./Routers/story.routes.js";
import userRouter from "./Routers/user.routes.js";
import songRouter from "./Routers/song.routes.js";
import messageRouter from "./Routers/message.routes.js";
import notificationRouter from "./Routers/notification.routes.js";
import connectDB from "./src/config/db.connection.js";
import cors from "cors";
import helmet from "helmet";
import { clerkMiddleware } from "@clerk/express";
import { requireClerkAuth } from "./middlewares/clerkMiddleware.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import { createServer } from "node:http";

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL;

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();

const httpServer = createServer(app);

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));

const io = new Server(httpServer, {
  cors: corsOptions,
});

// set socket server
app.set("io", io);

io.on("connection", (socket) => {

  const userId = socket.handshake.auth?.userId;
  if (!userId) {
    socket.disconnect(true);
    return;
  }

  socket.join(`user:${userId}`);
  
  console.log("User connected...", userId);

  socket.on("send_message", (message) => {
    if (message.senderId !== userId) return;
    io.to(`user:${message.receiverId}`).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected...", userId);
  });
});

app.use(cors(corsOptions));

app.options(/.*/, cors(corsOptions));

// Allow the browser to load video range requests across those origins.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use("/uploads", express.static(path.join(serverDirectory, "uploads")));

// Clerk webhook needs the raw request body for signature verification.
app.use("/api/webhook", webhookRouter);

// set the limit of data
app.use(express.json({ limit: "100mb" }));

app.use(clerkMiddleware());

// post api
app.use("/api/posts", requireClerkAuth, postRouter);
// comment api
app.use("/api/comments", requireClerkAuth, commentRouter);
// story api
app.use("/api/stories", requireClerkAuth, storyRouter);
// users api
app.use("/api/users", requireClerkAuth, userRouter);
// songs api
app.use("/api/songs", requireClerkAuth, songRouter);
// message api
app.use("/api/messages", requireClerkAuth, messageRouter);
// notification api
app.use("/api/notifications", requireClerkAuth, notificationRouter);

const PORT = Number(process.env.PORT);

const startServer = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();

    console.log("MongoDB connected. Starting Express server...");

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

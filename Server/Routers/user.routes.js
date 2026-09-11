  import express from "express";
  import {
    getUsers,
    getUser,
    updateUser,
    followUser,
    unfollowUser,
  } from "../controllers/user.controller.js";

  const router = express.Router();

  router.get("/", getUsers);
  router.get("/:id", getUser);
  router.patch("/:id", updateUser);

  router.post("/:id/follow", followUser);
  router.post("/:id/unfollow", unfollowUser );

  // router.get("/search", searchUser;

  export default router;

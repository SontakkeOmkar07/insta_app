import express from "express";
import { getSongs, getSong, saveSong, unsaveSong } from "../controllers/song.controller.js";

const router = express.Router();

router.get("/", getSongs);
router.get("/:id", getSong);
router.post("/:id/save", saveSong);
router.delete("/:id/save", unsaveSong);

export default router;

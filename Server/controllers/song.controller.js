import Song from "../models/songSchema.js";
import User from "../models/userSchema.js";
import mongoose from "mongoose";

const formatSong = (song, savedSongIds = []) => ({
  id: song.id,
  title: song.title,
  artist: song.artist,
  albumArt: song.albumArt, 
  audioUrl: song.audioUrl,
  duration: song.duration,
  isTrending: song.isTrending,
  isPopular: song.isPopular,
  isSaved: savedSongIds.includes(song.id),
  category: song.category,
});

const findSong = async (id) => {
  const conditions = [{ id }];
  if (mongoose.isValidObjectId(id)) conditions.push({ _id: id });
  return Song.findOne({ $or: conditions });
};

const getSongs = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.clerkUserId }).select("savedSongs");
    const filter = {};
    if (req.query.category && req.query.category !== "All") {
      if (req.query.category === "Trending") filter.isTrending = true;
      else if (req.query.category === "Popular") filter.isPopular = true;
      else if (req.query.category === "Saved") filter.id = { $in: user?.savedSongs || [] };
      else filter.category = req.query.category;
    }

    const songs = await Song.find(filter).sort({ createdAt: -1 });

    const savedSongIds = user?.savedSongs || [];

    return res.status(200).json({
      success: true,
      data: songs.map((song) => formatSong(song, savedSongIds)),
    });
  } catch (error) {
    console.error("Get songs error:", error);
    return res.status(500).json({ success: false, message: "Songs not found" });
  }
};

const getSong = async (req, res) => {
  try {
    const [song, user] = await Promise.all([
      findSong(req.params.id),
      User.findOne({ clerkId: req.clerkUserId }).select("savedSongs"),
    ]);

    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    return res.status(200).json({
      success: true,
      data: formatSong(song, user?.savedSongs || []),
    });
  } catch (error) {
    console.error("Get song error:", error);
    return res.status(500).json({ success: false, message: "Song not found" });
  }
};

const saveSong = async (req, res) => {
  try {
    const [song, user] = await Promise.all([
      findSong(req.params.id),
      await User.findOne({ clerkId: req.clerkUserId }),
    ]);

    if (!song) return res.status(404).json({ success: false, message: "Song not found" });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.savedSongs.includes(song.id)) user.savedSongs.push(song.id);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Song saved",
      data: formatSong(song, user.savedSongs),
    });
  } catch (error) {
    console.error("Save song error:", error);
    return res.status(500).json({ success: false, message: "Song not saved" });
  }
};

const unsaveSong = async (req, res) => {
  try {
    const [song, user] = await Promise.all([
      findSong(req.params.id),
      await User.findOne({ clerkId: req.clerkUserId }),
    ]);

    if (!song) return res.status(404).json({ success: false, message: "Song not found" });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.savedSongs = user.savedSongs.filter((songId) => songId !== song.id);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Song unsaved",
      data: formatSong(song, user.savedSongs),
    });
  } catch (error) {
    console.error("Unsave song error:", error);
    return res.status(500).json({ success: false, message: "Song not unsaved" });
  }
};

export { getSongs, getSong, saveSong, unsaveSong };

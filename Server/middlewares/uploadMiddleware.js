import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadDirectory = path.resolve("uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
  },
});

export const uploadStoryMedia = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      callback(null, true);
    } else {
      callback(new Error("Only image and video files are allowed"));
    }
  },
});



export const handleStoryUpload = (req, res, next) => {
  
  uploadStoryMedia.single("file")(req, res, (error) => {
    if (error) {
      console.error("Story upload error:", error);

      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "Video is too large. Maximum size is 100 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Invalid media upload",
      });
    }

    next();
  });
};


import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useData } from "../../context/DataCOntext";
import { MapPin, X, Plus, Upload, Smile } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const CreatePostModal = ({ isOpen, onClose }) => {
  const { createPost,showToast } = useData();

  const { currentUser, userId } = useAuth();

  const [imageUrls, setImageUrls] = useState([]);
  const [currentInputUrl, setCurrentInputUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const presets = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
  ];

  const handleAddUrl = (url) => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      showToast("Please add an image URL", "error");
      return;
    }

    if (imageUrls.includes(trimmedUrl)) {
      showToast("This image URL is already added", "error");
      return;
    }

    setImageUrls([...imageUrls, url.trim()]);
    setCurrentInputUrl("");
  };

  const handleRemoveUrl = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result;
      if (typeof imageDataUrl === "string") {
        setImageUrls((previous) =>
          previous.includes(imageDataUrl)
            ? previous
            : [...previous, imageDataUrl],
        );
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalImages =
      imageUrls.length > 0
        ? imageUrls
        : currentInputUrl.trim()
          ? [currentInputUrl.trim()]
          : [];
    if (finalImages.length === 0) return;

    console.log("currentUser:", currentUser);
    console.log("userId:", userId);
    console.log("avatar:", currentUser?.image);

    if (!caption.trim()) {
      alert("Please add a caption");
      return;
    }
    if (!location.trim()) {
      alert("Please add a location");
      return;
    }

    if (!userId || !currentUser?.image) {
      console.log("User information is missing");
      return;
    }

    setIsLoading(true);
    try {
      await createPost({
        userId,
        userAvatar: currentUser?.image,
        username: currentUser?.username || "",
        images: finalImages,
        caption: caption.trim(),
        location: location.trim(),
      });

      setImageUrls([]);
      setCurrentInputUrl("");
      setCaption("");
      setLocation("");
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create new post"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preset Selectors */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
            Select sample photos or add image URL(s)
          </label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {presets.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => handleAddUrl(preset)}
                className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:scale-105 transition-transform"
              >
                <img
                  src={preset}
                  alt="preset"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste image URL (https://...)"
              value={currentInputUrl}
              onChange={(e) => setCurrentInputUrl(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleAddUrl(currentInputUrl)}
            >
              <Plus className="w-4 h-4" /> Add
            </Button>

            <label className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer shrink-0">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Selected Images Grid Preview */}
        {imageUrls.length > 0 && (
          <div>
            <div className="text-xs font-bold text-neutral-500 mb-2">
              Selected Photos ({imageUrls.length})
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {imageUrls.map((url, i) => (
                <div
                  key={url}
                  className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden group"
                >
                  <img
                    src={url}
                    alt="selected"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(i)}
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Caption Area */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
            Caption
          </label>
          <textarea
            rows={3}
            placeholder="Write a caption... #hashtag"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />
        </div>

        {/* Location Input */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
            Add Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={isLoading}
            disabled={imageUrls.length === 0 && !currentInputUrl.trim()}
          >
            Share
          </Button>
        </div>
      </form>
    </Modal>
  );
};

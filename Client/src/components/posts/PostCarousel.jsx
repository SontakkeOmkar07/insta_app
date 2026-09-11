import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';

export const PostCarousel = ({ images, onDoubleTapLike }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHeartPop, setShowHeartPop] = useState(false);

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDoubleClick = () => {
    setShowHeartPop(true);
    if (onDoubleTapLike) onDoubleTapLike();
    setTimeout(() => setShowHeartPop(false), 900);
  };

  if (!images || images.length === 0) return null;

  return (
    <div
      className="relative aspect-square w-full bg-neutral-900 overflow-hidden group select-none cursor-pointer"
      onDoubleClick={handleDoubleClick}
    >
      {/* Current Image */}
      <img
        src={images[currentIndex]}
        alt={`Post content ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-300"
        loading="lazy"
      />

      {/* Double Tap Heart Animation Overlay */}
      {showHeartPop && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 pointer-events-none animate-in zoom-in-50 duration-200">
          <Heart className="w-24 h-24 fill-rose-500 text-rose-500 drop-shadow-2xl animate-bounce" />
        </div>
      )}

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black text-neutral-900 dark:text-white rounded-full flex items-center justify-center shadow-md backdrop-blur-xs transition-transform active:scale-90 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {currentIndex < images.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black text-neutral-900 dark:text-white rounded-full flex items-center justify-center shadow-md backdrop-blur-xs transition-transform active:scale-90 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Dot Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
            {images.map((image, idx) => (
              <div
                key={image || idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  idx === currentIndex ? 'bg-sky-400 w-2.5' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
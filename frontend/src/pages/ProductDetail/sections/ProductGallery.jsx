import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlay } from 'react-icons/fi';

const ProductGallery = ({ images, videos, discount, currentImageIndex = 0, setCurrentImageIndex, selectedColorId }) => {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  
  // Combine images and videos into one media array
  let displayMedia = [];
  const seenColorIds = new Set();
  
  // Add images first (lọc 1 ảnh mỗi màu)
  if (images && images.length > 0) {
    images.forEach(img => {
      const colorId = img.product_option_value_id;
      if (colorId && !seenColorIds.has(colorId)) {
        seenColorIds.add(colorId);
        displayMedia.push({ type: 'image', ...img });
      } else if (!colorId) {
        displayMedia.push({ type: 'image', ...img });
      }
    });
  }
  
  // Add videos
  if (videos && videos.length > 0) {
    videos.forEach(video => {
      displayMedia.push({ type: 'video', ...video });
    });
  }
  
  // Fallback nếu không có media
  if (displayMedia.length === 0) {
    displayMedia = [{ type: 'image', image_url: '/placeholder.png' }];
  }

  const handlePrevMedia = () => {
    if (setCurrentImageIndex) {
      setIsPlayingVideo(false);
      setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : displayMedia.length - 1));
    }
  };

  const handleNextMedia = () => {
    if (setCurrentImageIndex) {
      setIsPlayingVideo(false);
      setCurrentImageIndex(prev => (prev < displayMedia.length - 1 ? prev + 1 : 0));
    }
  };

  const handleThumbnailClick = (index) => {
    if (setCurrentImageIndex) {
      setIsPlayingVideo(displayMedia[index]?.type === 'video');
      setCurrentImageIndex(index);
    }
  };

  const currentMedia = displayMedia[currentImageIndex] || displayMedia[0];
  const isCurrentVideo = currentMedia?.type === 'video';

  return (
    <div className="flex-1 flex flex-col gap-2 sm:gap-4">
      {/* Main Media Display */}
      <div className="relative bg-white border border-gray-200">
        <div className="relative w-full aspect-square overflow-hidden group">
          {/* Image or Video */}
          {isCurrentVideo ? (
            <video
              src={currentMedia.video_url}
              controls
              autoPlay={isPlayingVideo}
              className="w-full h-full object-contain bg-black"
              onError={(e) => { 
                e.target.src = '';
                e.target.poster = '/placeholder.png';
              }}
            />
          ) : (
            <>
              <img
                src={currentMedia.image_url}
                alt="Product main view"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = '/placeholder.png'; }}
              />
            </>
          )}

          {/* Discount Badge */}
          {discount && !isCurrentVideo && (
            <div className="absolute top-0 left-0 bg-[#ee4d2d] text-white px-2 py-0.5 text-xs font-semibold">
              {discount}
            </div>
          )}

          {/* Navigation Arrows */}
          {displayMedia.length > 1 && (
            <>
              <button
                onClick={handlePrevMedia}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-sm shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Previous media"
              >
                <FiChevronLeft className="text-xl text-gray-700" />
              </button>
              <button
                onClick={handleNextMedia}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-sm shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Next media"
              >
                <FiChevronRight className="text-xl text-gray-700" />
              </button>
            </>
          )}

          {/* Media Counter */}
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-sm text-xs">
            {currentImageIndex + 1}/{displayMedia.length}
          </div>
        </div>
      </div>

      {/* Thumbnails - Images and Videos */}
      {displayMedia.length > 1 && (
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {displayMedia.map((media, idx) => (
            <div
              key={idx}
              onClick={() => handleThumbnailClick(idx)}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 cursor-pointer border-2 transition-all ${
                idx === currentImageIndex
                  ? 'border-[#ee4d2d]'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              {media.type === 'video' ? (
                <>
                  <video
                    src={media.video_url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <FiPlay className="text-white text-2xl" />
                  </div>
                </>
              ) : (
                <img
                  src={media.image_url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/placeholder.png'; }}
                />
              )}
              {idx === currentImageIndex && (
                <div className="absolute inset-0 bg-white/20"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;

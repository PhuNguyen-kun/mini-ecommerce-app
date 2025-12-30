import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlay } from 'react-icons/fi';

const ProductGallery = ({ images, videos, discount, currentImageIndex = 0, setCurrentImageIndex, selectedColorId }) => {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Reset về ảnh đầu tiên khi đổi màu
  useEffect(() => {
    if (setCurrentImageIndex) {
      setCurrentImageIndex(0);
    }
  }, [selectedColorId, setCurrentImageIndex]);

  let displayMedia = [];

  // 1. Lọc và thêm ảnh
  if (images && images.length > 0) {
    images.forEach(img => {
      // Logic lọc:
      // - Nếu img.product_option_value_id là null/undefined -> Đây là ảnh chung -> Luôn hiển thị
      // - Nếu img.product_option_value_id trùng với selectedColorId -> Đây là ảnh của màu đang chọn -> Hiển thị
      // - Nếu chưa có selectedColorId (mới vào trang) -> Hiển thị tất cả
      const isCommonImage = !img.product_option_value_id;
      const isMatchColor = img.product_option_value_id === selectedColorId;

      if (!selectedColorId || isCommonImage || isMatchColor) {
        displayMedia.push({ type: 'image', ...img });
      }
    });
  }

  // 2. Thêm video (Video thường hiển thị cho mọi biến thể)
  if (videos && videos.length > 0) {
    videos.forEach(video => {
      displayMedia.push({ type: 'video', ...video });
    });
  }

  // Fallback
  if (displayMedia.length === 0) {
    displayMedia = [{ type: 'image', image_url: '/placeholder.png' }];
  }

  // Đảm bảo index không vượt quá độ dài mảng khi filter thay đổi
  const safeIndex = currentImageIndex >= displayMedia.length ? 0 : currentImageIndex;
  const currentMedia = displayMedia[safeIndex] || displayMedia[0];
  const isCurrentVideo = currentMedia?.type === 'video';

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

  return (
    <div className="flex-1 flex flex-col gap-2 sm:gap-4">
      {/* Main Media Display */}
      <div className="relative bg-white border border-gray-200">
        <div className="relative w-full aspect-square overflow-hidden group">
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
            <img
              src={currentMedia.image_url}
              alt="Product main view"
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = '/placeholder.png'; }}
            />
          )}

          {discount && !isCurrentVideo && (
            <div className="absolute top-0 left-0 bg-[#ee4d2d] text-white px-2 py-0.5 text-xs font-semibold">
              {discount}
            </div>
          )}

          {displayMedia.length > 1 && (
            <>
              <button
                onClick={handlePrevMedia}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-sm shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <FiChevronLeft className="text-xl text-gray-700" />
              </button>
              <button
                onClick={handleNextMedia}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-sm shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <FiChevronRight className="text-xl text-gray-700" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-sm text-xs">
            {safeIndex + 1}/{displayMedia.length}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {displayMedia.length > 1 && (
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {displayMedia.map((media, idx) => (
            <div
              key={idx}
              onClick={() => handleThumbnailClick(idx)}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 cursor-pointer border-2 transition-all ${idx === safeIndex
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
              {idx === safeIndex && (
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
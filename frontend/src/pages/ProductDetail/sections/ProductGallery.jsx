import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ProductGallery = ({ images, discount, currentImageIndex = 0, setCurrentImageIndex, selectedColorId }) => {
  // Lọc ảnh: chỉ lấy 1 ảnh cho mỗi màu (dựa vào product_option_value_id)
  let displayImages = [];
  const seenColorIds = new Set();
  
  if (images && images.length > 0) {
    images.forEach(img => {
      const colorId = img.product_option_value_id;
      if (colorId && !seenColorIds.has(colorId)) {
        seenColorIds.add(colorId);
        displayImages.push(img);
      } else if (!colorId) {
        // Ảnh không có màu (general images)
        displayImages.push(img);
      }
    });
  }
  
  // Fallback nếu không có ảnh
  if (displayImages.length === 0) {
    displayImages = [{ image_url: '/placeholder.png' }];
  }

  const handlePrevImage = () => {
    if (setCurrentImageIndex) {
      setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : displayImages.length - 1));
    }
  };

  const handleNextImage = () => {
    if (setCurrentImageIndex) {
      setCurrentImageIndex(prev => (prev < displayImages.length - 1 ? prev + 1 : 0));
    }
  };

  const handleThumbnailClick = (index) => {
    if (setCurrentImageIndex) {
      setCurrentImageIndex(index);
    }
  };

  const mainImage = displayImages[currentImageIndex] || displayImages[0];

  return (
    <div className="flex-1 flex flex-col gap-2 sm:gap-4">
      {/* Main Image - Giống Shopee */}
      <div className="relative bg-white border border-gray-200">
        <div className="relative w-full aspect-square overflow-hidden group">
          {/* Main Image */}
          <img
            src={mainImage.image_url}
            alt="Product main view"
            className="w-full h-full object-contain"
            onError={(e) => { e.target.src = '/placeholder.png'; }}
          />

          {/* Discount Badge */}
          {discount && (
            <div className="absolute top-0 left-0 bg-[#ee4d2d] text-white px-2 py-0.5 text-xs font-semibold">
              {discount}
            </div>
          )}

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-sm shadow opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <FiChevronLeft className="text-xl text-gray-700" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-sm shadow opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <FiChevronRight className="text-xl text-gray-700" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-sm text-xs">
            {currentImageIndex + 1}/{displayImages.length}
          </div>
        </div>
      </div>

      {/* Thumbnails - Nằm ngang dưới ảnh chính giống Shopee */}
      {displayImages.length > 1 && (
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => handleThumbnailClick(idx)}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 cursor-pointer border-2 transition-all ${
                idx === currentImageIndex
                  ? 'border-[#ee4d2d]'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={img.image_url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/placeholder.png'; }}
              />
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

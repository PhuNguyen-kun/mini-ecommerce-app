const ProductGallery = ({ images, discount }) => {
  // Extract image URLs from API response
  const imageUrls = images?.map(img => img.image_url) || [];
  
  // Ensure we have at least 6 images (repeat or use placeholder if needed)
  const displayImages = [...imageUrls];
  while (displayImages.length < 6) {
    displayImages.push(imageUrls[0] || '/placeholder.png');
  }

  return (
    <div className="flex-1 flex flex-col gap-2">
      {/* Row 1: Two images */}
      <div className="flex gap-2">
        <div className="flex-1 h-[508px] relative">
          <img
            src={displayImages[0]}
            alt="Product view 1"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/placeholder.png'; }}
          />
          {discount && (
            <div className="absolute top-2 left-2 bg-white px-1.5 py-1 flex items-center justify-center">
              <p className="text-xs text-[#D0021B] text-center font-['Maison_Neue'] tracking-[0.2px]">
                {discount}
              </p>
            </div>
          )}
        </div>
        <div className="flex-1 h-[508px] relative">
          <img
            src={displayImages[1]}
            alt="Product view 2"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/placeholder.png'; }}
          />
        </div>
      </div>

      {/* Row 2: Two images */}
      <div className="flex gap-2">
        <div className="flex-1 h-[508px] relative">
          <img
            src={displayImages[2]}
            alt="Product view 3"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/placeholder.png'; }}
          />
        </div>
        <div className="flex-1 h-[508px] relative">
          <img
            src={displayImages[3]}
            alt="Product view 4"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/placeholder.png'; }}
          />
        </div>
      </div>

      {/* Row 3: Two images */}
      <div className="flex gap-2">
        <div className="flex-1 h-[508px] relative">
          <img
            src={displayImages[4]}
            alt="Product view 5"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/placeholder.png'; }}
          />
        </div>
        <div className="flex-1 h-[508px] relative">
          <img
            src={displayImages[5]}
            alt="Product view 6"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/placeholder.png'; }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;

const ProductGallery = ({ images, discount }) => {
  return (
    <div className="flex-1 flex flex-col gap-2">
      {/* Row 1: Two images */}
      <div className="flex gap-2">
        <div className="flex-1 h-[508px] relative">
          <img
            src={images[0]}
            alt="Product view 1"
            className="w-full h-full object-cover"
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
            src={images[1]}
            alt="Product view 2"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Row 2: Two images */}
      <div className="flex gap-2">
        <div className="flex-1 h-[508px] relative">
          <img
            src={images[2]}
            alt="Product view 3"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 h-[508px] relative">
          <img
            src={images[3]}
            alt="Product view 4"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Row 3: Two images */}
      <div className="flex gap-2">
        <div className="flex-1 h-[508px] relative">
          <img
            src={images[4]}
            alt="Product view 5"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 h-[508px] relative">
          <img
            src={images[5]}
            alt="Product view 6"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;

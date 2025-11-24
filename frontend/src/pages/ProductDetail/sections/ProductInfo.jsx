import { TbTruckDelivery, TbPackage, TbGift } from 'react-icons/tb';
import { useCart } from '../../../context/CartContext';
import { useState } from 'react';

const ProductInfo = ({ product, selectedSize, setSelectedSize, selectedColor, setSelectedColor }) => {
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select a size and color');
      return;
    }

    addToCart(product, selectedSize, selectedColor);
    setAddedToCart(true);
    
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  const renderStars = (rating, size = 12) => {
    const fullStars = Math.floor(rating);
    
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 16 16" fill={i < fullStars ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1" className="text-black">
            <path d="M8 1.5l1.902 5.853h6.153l-4.975 3.615 1.902 5.853L8 13.206l-4.982 3.615 1.902-5.853L0 7.353h6.153z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="w-[384px] flex flex-col gap-px">
      {/* Header Section */}
      <div className="border-b border-[#F5F4F4] pb-4 flex flex-col gap-1">
        <p className="text-xs text-neutral-500 tracking-[0.2px] font-['Maison_Neue']">
          {product.category}
        </p>
        <div className="flex gap-2.5 items-start">
          <p className="flex-1 text-2xl text-black leading-[33.24px] font-['Maison_Neue']">
            {product.name}
          </p>
          <div className="flex gap-1 items-center text-2xl leading-[33.24px] font-['Maison_Neue']">
            {product.originalPrice && (
              <p className="text-neutral-500 line-through">${product.originalPrice}</p>
            )}
            <p className="text-black">${product.price}</p>
          </div>
        </div>
        <div className="flex gap-2.5 items-center">
          {renderStars(product.rating)}
          <p className="text-xs text-neutral-500 tracking-[0.2px] font-['Maison_Neue']">
            {product.rating} ({product.reviewCount} Reviews)
          </p>
        </div>
      </div>

      {/* Color Selection */}
      <div className="py-[18px] flex flex-col gap-2.5">
        <div className="flex gap-3 items-start text-xs text-black tracking-[0.2px]">
          <p className="font-semibold font-['Maison_Neue']">Color</p>
          <p className="font-['Maison_Neue']">{selectedColor}</p>
        </div>
        <div className="flex gap-3">
          {product.colors.map((color, index) => (
            <button
              key={index}
              onClick={() => setSelectedColor(color.name)}
              className={`w-8 h-8 rounded-full border-2 ${
                selectedColor === color.name ? 'border-black' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="py-[18px] flex flex-col gap-2.5">
        <div className="flex items-start justify-between text-xs tracking-[0.2px]">
          <p className="font-semibold text-black font-['Maison_Neue']">Size</p>
          <p className="underline text-neutral-800 font-['Maison_Neue']">Size Guide</p>
        </div>
        <div className="flex gap-3">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-[45px] p-3 text-xs text-neutral-800 tracking-[0.2px] font-['Maison_Neue'] ${
                selectedSize === size ? 'bg-neutral-800 text-white' : 'bg-[#F5F4F4]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Add to Bag Button */}
      <div className="py-8 flex flex-col gap-2.5 items-center justify-center">
        <button 
          onClick={handleAddToCart}
          className={`w-full py-3 flex items-center justify-center transition-colors ${
            addedToCart ? 'bg-green-600' : 'bg-neutral-800 hover:bg-black'
          }`}
        >
          <p className="text-sm text-white text-center tracking-[1.4px] font-['Maison_Neue']">
            {addedToCart ? 'ADDED TO CART!' : 'ADD TO BAG'}
          </p>
        </button>
      </div>

      {/* Features */}
      <div className="border-t border-[#DDDBDC] py-6 flex flex-col gap-6">
        {/* Free Shipping */}
        <div className="flex gap-4 items-center">
          <div className="w-[34px] h-[34px] flex items-center justify-center">
            <TbTruckDelivery className="w-[34px] h-[34px]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 flex flex-col">
            <p className="text-sm font-semibold text-black tracking-[0.42px] font-['Maison_Neue']">
              Free Shipping
            </p>
            <p className="text-xs text-black tracking-[0.2px] font-['Maison_Neue']">
              On all U.S. orders over $100 <span className="underline">Learn more.</span>
            </p>
          </div>
        </div>

        {/* Easy Returns */}
        <div className="flex gap-4 items-center">
          <div className="w-[34px] h-[34px] flex items-center justify-center">
            <TbPackage className="w-[34px] h-[34px]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 flex flex-col">
            <p className="text-sm font-semibold text-black tracking-[0.42px] font-['Maison_Neue']">
              Easy Returns
            </p>
            <p className="text-xs text-black tracking-[0.2px] font-['Maison_Neue']">
              Extended returns through January 31. <span className="underline">Returns Details.</span>
            </p>
          </div>
        </div>

        {/* Send as Gift */}
        <div className="flex gap-4 items-center">
          <div className="w-[34px] h-[34px] flex items-center justify-center">
            <TbGift className="w-[34px] h-[34px]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 flex flex-col">
            <p className="text-sm font-semibold text-black tracking-[0.42px] font-['Maison_Neue']">
              Send It As A Gift
            </p>
            <p className="text-xs text-black tracking-[0.2px] font-['Maison_Neue']">
              Add a free personalized note during checkout.
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="border-t border-[#DDDBDC] pt-10 pb-3 flex flex-col gap-4">
        <p className="text-base font-semibold text-black tracking-[0.2px] font-['Maison_Neue']">
          Part shirt, part jacket, all style.
        </p>
        <p className="text-sm text-black tracking-[1.4px] leading-[16.8px] font-['Maison_Neue']">
          {product.description}
        </p>
      </div>

      {/* Model Info */}
      <div className="border-b border-[#DDDBDC] py-5 flex items-center">
        <p className="w-[106px] text-base font-semibold text-black tracking-[0.2px] font-['Maison_Neue']">
          Model
        </p>
        <p className="flex-1 text-sm text-black tracking-[1.4px] leading-[16.8px] font-['Maison_Neue']">
          {product.model}
        </p>
      </div>

      {/* Fit Info */}
      <div className="border-b border-[#DDDBDC] py-5 flex items-start">
        <p className="w-[106px] text-base font-semibold text-black tracking-[0.2px] font-['Maison_Neue']">
          Fit
        </p>
        <div className="flex-1 text-sm text-black tracking-[1.4px] leading-[16.8px] font-['Maison_Neue']">
          <p>Questions about fit?</p>
          <p>Contact Us</p>
          <p>Size Guide</p>
        </div>
      </div>

      {/* Sustainability */}
      <div className="border-b border-[#DDDBDC] py-5 flex flex-col">
        <p className="text-base font-semibold text-black tracking-[0.2px] font-['Maison_Neue']">
          Sustainability
        </p>

      </div>
    </div>
  );
};

export default ProductInfo;

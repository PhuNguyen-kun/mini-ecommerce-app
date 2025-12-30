import { TbTruckDelivery, TbPackage, TbGift } from 'react-icons/tb';
import { useCart } from '../../../context/CartContext';
import WishlistButton from '../../../components/WishlistButton';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductInfo = ({ product, selectedSize, setSelectedSize, selectedColor, setSelectedColor, selectedVariant }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Format price to VND with thousands separator
  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Extract colors, sizes, and pricing from variants
  const { colors, sizes, minPrice } = useMemo(() => {
    const colorMap = new Map();
    const sizeSet = new Set();
    let min = Infinity;

    product.variants?.forEach(variant => {
      if (variant.price < min) min = variant.price;

      variant.option_values?.forEach(optVal => {
        const optionName = optVal.option?.name?.toLowerCase();
        if (optionName === 'màu sắc' || optionName === 'color') {
          if (!colorMap.has(optVal.value)) {
            // Comprehensive color mapping for accurate display
            const colorHexMap = {
              // Tiếng Việt
              'Đen': '#000000',
              'Trắng': '#FFFFFF',
              'Xám': '#9CA3AF',
              'Xám Đậm': '#4B5563',
              'Xám Nhạt': '#E5E7EB',
              'Be': '#D2B48C',
              'Nâu': '#8B4513',
              'Nâu Đậm': '#654321',
              'Nâu Nhạt': '#D2691E',
              'Đỏ': '#EF4444',
              'Đỏ Đô': '#DC143C',
              'Đỏ Tươi': '#FF0000',
              'Hồng': '#EC4899',
              'Hồng Nhạt': '#FFC0CB',
              'Hồng Đậm': '#FF1493',
              'Cam': '#F97316',
              'Cam Đậm': '#FF8C00',
              'Vàng': '#FCD34D',
              'Vàng Nhạt': '#FFFFE0',
              'Vàng Gold': '#FFD700',
              'Xanh Lá': '#22C55E',
              'Xanh lá': '#22C55E',  // lowercase variant
              'Xanh Lá Đậm': '#15803D',
              'Xanh Lá Nhạt': '#86EFAC',
              'Xanh Dương': '#3B82F6',
              'Xanh dương': '#3B82F6',  // lowercase variant
              'Xanh Navy': '#1E3A8A',
              'Xanh navy': '#1E3A8A',  // lowercase variant
              'Xanh Da Trời': '#60A5FA',
              'Xanh Ngọc': '#14B8A6',
              'Xanh Mint': '#6EE7B7',
              'Tím': '#A855F7',
              'Tím Đậm': '#7C3AED',
              'Tím Nhạt': '#C4B5FD',
              
              // English
              'Black': '#000000',
              'White': '#FFFFFF',
              'Grey': '#9CA3AF',
              'Gray': '#9CA3AF',
              'Dark Grey': '#4B5563',
              'Dark Gray': '#4B5563',
              'Light Grey': '#E5E7EB',
              'Light Gray': '#E5E7EB',
              'Beige': '#D2B48C',
              'Brown': '#8B4513',
              'Dark Brown': '#654321',
              'Light Brown': '#D2691E',
              'Red': '#EF4444',
              'Crimson': '#DC143C',
              'Bright Red': '#FF0000',
              'Pink': '#EC4899',
              'Light Pink': '#FFC0CB',
              'Hot Pink': '#FF1493',
              'Orange': '#F97316',
              'Dark Orange': '#FF8C00',
              'Yellow': '#FCD34D',
              'Light Yellow': '#FFFFE0',
              'Gold': '#FFD700',
              'Green': '#22C55E',
              'Dark Green': '#15803D',
              'Light Green': '#86EFAC',
              'Blue': '#3B82F6',
              'Navy': '#1E3A8A',
              'Sky Blue': '#60A5FA',
              'Teal': '#14B8A6',
              'Mint': '#6EE7B7',
              'Purple': '#A855F7',
              'Dark Purple': '#7C3AED',
              'Light Purple': '#C4B5FD',
              'Olive': '#808000',
              'Khaki': '#C3B091',
              'Maroon': '#800000',
              'Burgundy': '#800020',
              'Coral': '#FF7F50',
              'Salmon': '#FA8072',
              'Peach': '#FFDAB9',
              'Ivory': '#FFFFF0',
              'Cream': '#FFFDD0'
            };
            colorMap.set(optVal.value, colorHexMap[optVal.value] || '#000000');
          }
        } else if (optionName === 'kích cỡ' || optionName === 'size') {
          sizeSet.add(optVal.value);
        }
      });
    });

    const colorsArray = Array.from(colorMap.entries()).map(([name, value]) => ({ name, value }));
    const sizesArray = Array.from(sizeSet);

    return {
      colors: colorsArray,
      sizes: sizesArray,
      minPrice: formatPrice(min === Infinity ? 0 : min)
    };
  }, [product.variants, formatPrice]);

  const handleAddToCart = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?from=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!selectedSize || !selectedColor) {
      alert('Please select a size and color');
      return;
    }

    if (!selectedVariant) {
      alert('Selected combination not available');
      return;
    }

    setIsAdding(true);
    try {
      // Add to cart using variant ID
      await addToCart(selectedVariant.id, 1);
      
      setAddedToCart(true);
      
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const renderStars = (rating, size = 12) => {
    const fullStars = Math.floor(rating || 0);
    
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

  // Hiển thị giá và stock từ selectedVariant nếu có
  const displayPrice = selectedVariant ? formatPrice(selectedVariant.price) : minPrice;
  const displayStock = selectedVariant ? selectedVariant.stock : null;

  return (
    <div className="w-full lg:w-[384px] flex flex-col gap-px">
      {/* Header Section */}
      <div className="border-b border-[#F5F4F4] pb-3 sm:pb-4 flex flex-col gap-1">
        <p className="text-xs text-neutral-500 tracking-[0.2px] font-['Maison_Neue']">
          {product.category?.name || 'Product'}
        </p>
        <div className="flex gap-2 sm:gap-2.5 items-start">
          <p className="flex-1 text-xl sm:text-2xl text-black leading-tight sm:leading-[33.24px] font-['Maison_Neue']">
            {product.name}
          </p>
          <div className="flex gap-1.5 sm:gap-2 items-center">
            <div className="flex gap-1 items-center text-xl sm:text-2xl leading-tight sm:leading-[33.24px] font-['Maison_Neue']">
              <p className="text-black">{displayPrice}₫</p>
            </div>
            <WishlistButton productId={product.id} productData={product} size="md" />
          </div>
        </div>
        
        {/* Hiển thị stock nếu có selectedVariant */}
        {displayStock !== null && (
          <div className="text-xs sm:text-sm text-gray-600 mt-1 font-['Maison_Neue']">
            Tồn kho: <span className="font-semibold">{displayStock}</span>
          </div>
        )}
        
        <div className="flex gap-2.5 items-center">
          {renderStars(product.rating)}
          <p className="text-xs text-neutral-500 tracking-[0.2px] font-['Maison_Neue']">
            {product.rating || 0} ({product.review_count || 0} Reviews)
          </p>
        </div>
      </div>

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="py-4 sm:py-[18px] flex flex-col gap-2.5">
          <div className="flex gap-2 sm:gap-3 items-start text-xs text-black tracking-[0.2px]">
            <p className="font-semibold font-['Maison_Neue']">Color</p>
            <p className="font-['Maison_Neue']">{selectedColor}</p>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => setSelectedColor(color.name)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 ${
                  selectedColor === color.name ? 'border-black' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="py-4 sm:py-[18px] flex flex-col gap-2.5">
          <div className="flex items-start justify-between text-xs tracking-[0.2px]">
            <p className="font-semibold text-black font-['Maison_Neue']">Size</p>
            <p className="underline text-neutral-800 font-['Maison_Neue']">Size Guide</p>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[40px] sm:min-w-[45px] px-2.5 sm:px-3 py-2.5 sm:py-3 text-xs text-neutral-800 tracking-[0.2px] font-['Maison_Neue'] ${
                  selectedSize === size ? 'bg-neutral-800 text-white' : 'bg-[#F5F4F4]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add to Bag Button */}
      <div className="py-6 sm:py-8 flex flex-col gap-2.5 items-center justify-center">
        <button 
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`w-full py-2.5 sm:py-3 flex items-center justify-center transition-colors ${
            addedToCart ? 'bg-green-600' : 'bg-neutral-800 hover:bg-black'
          } ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <p className="text-xs sm:text-sm text-white text-center tracking-[1.4px] font-['Maison_Neue']">
            {addedToCart ? 'ADDED TO CART!' : isAdding ? 'ADDING...' : 'ADD TO BAG'}
          </p>
        </button>
      </div>

      {/* Features */}
      <div className="border-t border-[#DDDBDC] py-5 sm:py-6 flex flex-col gap-5 sm:gap-6">
        {/* Free Shipping */}
        <div className="flex gap-3 sm:gap-4 items-center">
          <div className="w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] flex items-center justify-center flex-shrink-0">
            <TbTruckDelivery className="w-full h-full" strokeWidth={1.5} />
          </div>
          <div className="flex-1 flex flex-col">
            <p className="text-xs sm:text-sm font-semibold text-black tracking-[0.42px] font-['Maison_Neue']">
              Free Shipping
            </p>
            <p className="text-xs text-black tracking-[0.2px] font-['Maison_Neue']">
              On all U.S. orders over $100 <span className="underline">Learn more.</span>
            </p>
          </div>
        </div>

        {/* Easy Returns */}
        <div className="flex gap-3 sm:gap-4 items-center">
          <div className="w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] flex items-center justify-center flex-shrink-0">
            <TbPackage className="w-full h-full" strokeWidth={1.5} />
          </div>
          <div className="flex-1 flex flex-col">
            <p className="text-xs sm:text-sm font-semibold text-black tracking-[0.42px] font-['Maison_Neue']">
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
          Product Details
        </p>
        <p className="text-sm text-black tracking-[1.4px] leading-[16.8px] font-['Maison_Neue']">
          {product.description || 'No description available.'}
        </p>
      </div>

      {/* Model Info */}
      {product.model_info && (
        <div className="border-b border-[#DDDBDC] py-5 flex items-center">
          <p className="w-[106px] text-base font-semibold text-black tracking-[0.2px] font-['Maison_Neue']">
            Model
          </p>
          <p className="flex-1 text-sm text-black tracking-[1.4px] leading-[16.8px] font-['Maison_Neue']">
            {product.model_info}
          </p>
        </div>
      )}

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

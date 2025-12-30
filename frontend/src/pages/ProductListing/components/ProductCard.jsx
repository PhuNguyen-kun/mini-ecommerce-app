import { Link } from 'react-router-dom';
import WishlistButton from '../../../components/WishlistButton';

const ProductCard = ({ product }) => {
  
  // Handle both card and full view modes
  // Card mode: has primary_image, price_from
  // Full mode: has images[], variants[]
  
  const primaryImage = product.primary_image || 
                       product.images?.find(img => img.is_primary)?.image_url || 
                       product.images?.[0]?.image_url || 
                       '/placeholder.png';
  
  const minPrice = product.price_from || 
                   product.variants?.reduce((min, variant) => Math.min(min, variant.price), Infinity) || 
                   0;
  
  // Format price to VND
  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };
  
  // Get unique colors from variants (only in full mode)
  const colors = product.variants?.reduce((acc, variant) => {
    variant.option_values?.forEach(opt => {
      if (opt.ProductOption?.name?.toLowerCase() === 'color' || opt.ProductOption?.name?.toLowerCase() === 'màu') {
        if (!acc.includes(opt.value)) {
          acc.push(opt.value);
        }
      }
    });
    return acc;
  }, []) || [];

  return (
    <Link to={`/product/${product.slug || product.id}`} className="group cursor-pointer flex flex-col gap-2.5">
      {/* Image Container */}
      <div className="relative w-full h-[280px] sm:h-[340px] lg:h-[392px] overflow-hidden bg-gray-100">
        <img 
          src={primaryImage} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
        />
        
        {/* Wishlist Button - Shows on Hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" onClick={(e) => e.preventDefault()}>
          <WishlistButton productId={product.id} productData={product} size="md" />
        </div>
        
        {/* View Details Overlay - Shows on Hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
          <span className="text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View Details
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-[3px] w-full">
        {/* Name and Price */}
        <div className="flex gap-2 sm:gap-3 items-start py-2 w-full">
          <p className="flex-1 text-xs sm:text-sm text-black leading-4 group-hover:underline font-['Maison_Neue']">
            {product.name}
          </p>
          <div className="flex gap-1 items-center text-xs sm:text-sm leading-4 text-right">
            <p className="text-black font-semibold font-['Maison_Neue']">
              {formatPrice(minPrice)}₫
            </p>
          </div>
        </div>

        {/* Color Name */}
        <p className="text-xs sm:text-sm text-gray-500 leading-4 h-4 font-['Maison_Neue']">
          {colors.length > 0 ? colors[0] : ''}
        </p>
      </div>

      {/* Color Swatches */}
      {colors.length > 0 && (
        <div className="flex gap-2.5 items-center w-full">
          {colors.slice(0, 4).map((color, index) => (
            <div 
              key={index}
              className="w-5 h-5 rounded-full border border-gray-300 cursor-pointer hover:border-gray-500 transition-colors"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}

      {/* Tags - Category name */}
      {product.category && (
        <div className="flex gap-2 items-start w-full">
          <div className="border border-[#dddbdc] px-2 py-1.5 text-[10px] text-gray-500 text-center tracking-[1px] leading-4 font-['Maison_Neue']">
            {product.category.name}
          </div>
        </div>
      )}
    </Link>
  );
};

export default ProductCard;

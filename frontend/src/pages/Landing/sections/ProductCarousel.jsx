import {  useRef } from "react";
import { Link } from "react-router-dom";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useWishlist } from "../../../context/WishlistContext";
import WishlistButton from "../../../components/WishlistButton";

export default function ProductCarousel() {
  const { wishlist } = useWishlist();
  const scrollContainerRef = useRef(null);

  // Get products directly from wishlist context
  const products = wishlist
    .filter(item => item.product) // Filter items with product data
    .map(item => item.product)
    .slice(0, 8); // Show max 8 products

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  // Format price to VND
  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Get min price from variants
  const getMinPrice = (product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((min, variant) => Math.min(min, variant.price), Infinity);
  };

  // Get primary image - giống ProductCard để đảm bảo consistency
  const getProductImage = (product) => {
    return product.images?.find(img => img.is_primary)?.image_url || 
           product.images?.[0]?.image_url || 
           '/placeholder.png';
  };

  // Get first color
  const getFirstColor = (product) => {
    if (!product.variants || product.variants.length === 0) return '';
    
    const firstVariant = product.variants[0];
    const colorOption = firstVariant.option_values?.find(opt => 
      opt.ProductOption?.name?.toLowerCase() === 'color' || 
      opt.ProductOption?.name?.toLowerCase() === 'màu'
    );
    
    return colorOption?.value || '';
  };

  if (products.length === 0) {
    return (
      <section className="w-full py-[90px]">
        <div className="px-10 mb-[100px]">
          <h2 className="text-[34px] font-normal mb-3 text-center">
            Sản Phẩm Yêu Thích Của Bạn
          </h2>
          <p className="text-lg text-gray-600 text-center">
            Đẹp. Chức năng. Thiết kế hoàn hảo.
          </p>
        </div>
        <div className="text-center py-10">
          <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm yêu thích nào.</p>
          <Link 
            to="/products" 
            className="inline-block bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12 sm:py-16 lg:py-[90px]">
      {/* Title Section */}
      <div className="px-4 sm:px-6 lg:px-10 mb-12 sm:mb-16 lg:mb-[100px]">
        <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-normal mb-2 sm:mb-3 text-center font-['Maison_Neue']">
          Sản Phẩm Yêu Thích Của Bạn
        </h2>
        <p className="text-base sm:text-lg text-gray-600 text-center font-['Maison_Neue']">
          Đẹp. Chức năng. Thiết kế hoàn hảo.
        </p>
      </div>

      {/* Carousel */}
      <div className="relative flex items-center gap-2 sm:gap-3">
        {/* Left Arrow */}
        <button 
          onClick={scrollLeft}
          className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center hover:bg-gray-100 transition-colors rounded-full"
          aria-label="Scroll left"
        >
          <HiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Products */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide px-2 sm:px-3"
          style={{ scrollBehavior: 'smooth' }}
        >
          {products.map((product) => {
            const productImage = getProductImage(product);
            const minPrice = getMinPrice(product);
            const color = getFirstColor(product);

            return (
              <div
                key={product.id}
                className="flex-shrink-0 w-[200px] sm:w-[240px] lg:w-[282px] group cursor-pointer"
              >
                <Link to={`/product/${product.slug || product.id}`}>
                  <div className="relative w-full h-[300px] sm:h-[360px] lg:h-[420px] rounded-lg overflow-hidden mb-2">
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Prevent infinite loop by checking if already set to placeholder
                        if (e.target.src !== window.location.origin + '/placeholder.png') {
                          e.target.src = '/placeholder.png';
                        }
                      }}
                    />
                    
                    {/* Wishlist Button */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" onClick={(e) => e.preventDefault()}>
                      <WishlistButton productId={product.id} productData={product} size="md" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="text-xs sm:text-sm flex-1 group-hover:underline font-['Maison_Neue']">
                        {product.name}
                      </p>
                      <p className="text-xs sm:text-sm font-medium font-['Maison_Neue']">
                        {formatPrice(minPrice)}₫
                      </p>
                    </div>
                    {color && <p className="text-xs sm:text-sm text-gray-600 font-['Maison_Neue']">{color}</p>}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={scrollRight}
          className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center hover:bg-gray-100 transition-colors rounded-full"
          aria-label="Scroll right"
        >
          <HiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Indicator */}
      <div className="flex justify-center gap-2 mt-12">
        <div className="w-2 h-2 rounded-full bg-black"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
      </div>
    </section>
  );
}

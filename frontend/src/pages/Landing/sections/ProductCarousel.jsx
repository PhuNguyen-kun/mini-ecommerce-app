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

  // Get primary image
  const getPrimaryImage = (product) => {
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
    <section className="w-full py-[90px]">
      {/* Title Section */}
      <div className="px-10 mb-[100px]">
        <h2 className="text-[34px] font-normal mb-3 text-center">
          Sản Phẩm Yêu Thích Của Bạn
        </h2>
        <p className="text-lg text-gray-600 text-center">
          Đẹp. Chức năng. Thiết kế hoàn hảo.
        </p>
      </div>

      {/* Carousel */}
      <div className="relative flex items-center gap-3">
        {/* Left Arrow */}
        <button 
          onClick={scrollLeft}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors rounded-full"
          aria-label="Scroll left"
        >
          <HiChevronLeft className="w-6 h-6" />
        </button>

        {/* Products */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-3"
          style={{ scrollBehavior: 'smooth' }}
        >
          {products.map((product) => {
            const primaryImage = getPrimaryImage(product);
            const minPrice = getMinPrice(product);
            const color = getFirstColor(product);

            return (
              <div
                key={product.id}
                className="flex-shrink-0 w-[282px] group cursor-pointer"
              >
                <Link to={`/product/${product.slug || product.id}`}>
                  <div className="relative w-full h-[420px] rounded-lg overflow-hidden mb-2">
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    
                    {/* Wishlist Button */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" onClick={(e) => e.preventDefault()}>
                      <WishlistButton productId={product.id} productData={product} size="md" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm flex-1 group-hover:underline">
                        {product.name}
                      </p>
                      <p className="text-sm font-medium">
                        {formatPrice(minPrice)}₫
                      </p>
                    </div>
                    {color && <p className="text-sm text-gray-600">{color}</p>}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={scrollRight}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors rounded-full"
          aria-label="Scroll right"
        >
          <HiChevronRight className="w-6 h-6" />
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

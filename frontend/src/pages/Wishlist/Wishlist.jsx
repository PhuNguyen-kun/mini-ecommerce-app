import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import WishlistButton from '../../components/WishlistButton';
import { HiOutlineHeart } from 'react-icons/hi2';

const Wishlist = () => {
  const { wishlist, isLoading, fetchWishlist } = useWishlist();

  useEffect(() => {
    fetchWishlist();
  }, []);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light mb-3 sm:mb-4 font-['Maison_Neue']">Sản Phẩm Yêu Thích</h1>
          <p className="text-gray-600 text-base sm:text-lg font-['Maison_Neue']">
            {wishlist.length > 0 
              ? `Bạn có ${wishlist.length} sản phẩm yêu thích`
              : 'Chưa có sản phẩm yêu thích nào'}
          </p>
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <HiOutlineHeart className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl font-light mb-3 sm:mb-4 text-gray-800 font-['Maison_Neue']">
              Danh sách yêu thích trống
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 font-['Maison_Neue']">
              Khám phá và thêm những sản phẩm bạn yêu thích vào đây
            </p>
            <Link 
              to="/products" 
              className="inline-block bg-black text-white px-6 sm:px-8 py-2.5 sm:py-3 hover:bg-gray-800 transition-colors text-sm sm:text-base font-['Maison_Neue']"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {wishlist.map((item) => {
              const product = item.product;
              if (!product) return null;

              const productImage = getProductImage(product);
              const minPrice = getMinPrice(product);
              
              return (
                <div key={item.id} className="group flex flex-col gap-2.5">
                  {/* Product Link Container */}
                  <Link 
                    to={`/product/${product.slug || product.id}`} 
                    className="relative w-full h-[300px] sm:h-[350px] lg:h-[392px] overflow-hidden bg-gray-100 block"
                  >
                    <img 
                      src={productImage} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    
                    {/* Wishlist Button - Always visible on wishlist page */}
                    <div className="absolute top-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
                      <WishlistButton productId={product.id} productData={product} size="md" />
                    </div>
                    
                    {/* View Details Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Xem chi tiết
                      </span>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex flex-col gap-[3px] w-full">
                    <Link to={`/product/${product.slug || product.id}`}>
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
                    </Link>

                    {/* Category */}
                    {product.category && (
                      <div className="flex gap-2 items-start w-full">
                        <div className="border border-[#dddbdc] px-2 py-1.5 text-[10px] text-gray-500 text-center tracking-[1px] leading-4 font-['Maison_Neue']">
                          {product.category.name}
                        </div>
                      </div>
                    )}

                    {/* Stock Status */}
                    {product.variants && product.variants.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1 font-['Maison_Neue']">
                        {product.variants.some(v => v.stock > 0) 
                          ? 'Còn hàng' 
                          : 'Hết hàng'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

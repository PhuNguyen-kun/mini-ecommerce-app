import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import productService from "../../../services/productService";
import WishlistButton from "../../../components/WishlistButton";

const RecommendedProducts = ({ currentProductId, gender, categoryId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setLoading(true);

        // Fetch products with same gender and category
        const response = await productService.getProducts({
          gender,
          category_ids: categoryId ? [categoryId] : [],
          limit: 12, // Increased to 12 products for carousel
          sort: "newest",
          view: "full", // Request full product details
        });

        if (response.success) {
          // Filter out current product
          const filtered = response.data.products.filter(
            (p) => p.id !== currentProductId
          );
          setProducts(filtered);
        }
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (gender || categoryId) {
      fetchRecommendedProducts();
    }
  }, [currentProductId, gender, categoryId]);

  // Format price to VND with thousands separator
  const formatPrice = (price) => {
    if (!price) return "0";
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1.5); // Mobile: show 1.5 items (for scrolling effect)
      } else if (window.innerWidth < 768) {
        setItemsPerView(2); // Small tablet: show 2 items
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3); // Tablet: show 3 items
      } else {
        setItemsPerView(4); // Desktop: show 4 items
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, products.length - itemsPerView);
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.offsetWidth;
      const itemWidth = containerWidth / itemsPerView;
      scrollContainerRef.current.scrollTo({
        left: currentIndex * itemWidth,
        behavior: "smooth",
      });
    }
  }, [currentIndex, itemsPerView]);

  if (loading) {
    return (
      <div className="px-3 sm:px-4 md:px-6 lg:px-10 xl:px-20 py-6 sm:py-8 md:py-12 lg:py-16 flex flex-col gap-4">
        <p className="text-base sm:text-lg font-semibold text-neutral-800 tracking-[0.2px]">
          Recommended Products
        </p>
        <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px] lg:w-[280px] h-[280px] sm:h-[320px] md:h-[360px] lg:h-[392px] bg-gray-200 animate-pulse rounded"
            />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < products.length - itemsPerView;

  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-10 xl:px-20 py-6 sm:py-8 md:py-12 lg:py-16 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-base sm:text-lg font-semibold text-neutral-800 tracking-[0.2px]">
          Recommended Products
        </p>

        {/* Navigation Arrows - Hide on mobile, show on tablet+ */}
        {products.length > itemsPerView && (
          <div className="hidden sm:flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={!canGoPrev}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-300 transition-colors ${
                canGoPrev
                  ? "hover:bg-gray-100 cursor-pointer"
                  : "opacity-30 cursor-not-allowed"
              }`}
              aria-label="Previous products"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-300 transition-colors ${
                canGoNext
                  ? "hover:bg-gray-100 cursor-pointer"
                  : "opacity-30 cursor-not-allowed"
              }`}
              aria-label="Next products"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollBehavior: "smooth" }}
        >
          {products.map((product) => {
            // Handle both card mode (primary_image) and full mode (images array)
            const primaryImage =
              product.primary_image ||
              product.images?.find((img) => img.is_primary)?.image_url ||
              product.images?.[0]?.image_url ||
              "/placeholder.png";
            const minPrice =
              product.min_price ||
              product.variants?.reduce(
                (min, variant) => Math.min(min, variant.price),
                Infinity
              ) ||
              0;

            // Get first color from variants
            const firstColor =
              product.variants?.[0]?.option_values?.find(
                (opt) =>
                  opt.option?.name?.toLowerCase() === "màu sắc" ||
                  opt.option?.name?.toLowerCase() === "color"
              )?.value || "";

            return (
              <Link
                key={product.id}
                to={`/product/${product.slug}`}
                className="flex-none w-[200px] sm:w-[220px] md:w-[240px] lg:w-[calc(25%-18px)] flex flex-col gap-2 sm:gap-2.5 group cursor-pointer"
              >
                <div className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[392px] w-full relative overflow-hidden bg-gray-100">
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />

                  {/* Wishlist Button */}
                  <div
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                    onClick={(e) => e.preventDefault()}
                  >
                    <WishlistButton
                      productId={product.id}
                      productData={product}
                      size="md"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-[3px]">
                  <div className="py-2 flex gap-2 sm:gap-3 items-start">
                    <p className="flex-1 text-xs sm:text-sm text-neutral-800 tracking-[0.2px] group-hover:underline line-clamp-2">
                      {product.name}
                    </p>
                    <div className="flex gap-1 items-center text-xs text-right tracking-[0.2px] flex-shrink-0">
                      <p className="text-neutral-800 font-semibold">
                        {formatPrice(minPrice)}₫
                      </p>
                    </div>
                  </div>
                  <p className="h-4 text-xs text-neutral-500 tracking-[0.2px]">
                    {firstColor}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts;

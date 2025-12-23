import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { API_ENDPOINTS } from "../../../config/api";

export default function InstagramGallery() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${API_ENDPOINTS.PRODUCTS.LIST}?limit=8&offset=5&view=full`
        );
        const data = await response.json();
        // API returns { data: { products: [...], pagination: {...} } }
        const productsArray = data.data?.products || [];
        setProducts(Array.isArray(productsArray) ? productsArray : []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 235.6; // width of one image (225.6px) + gap (10px)
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full py-[90px]">
      {/* Header */}
      <div className="text-center mb-12 px-[54px] pt-[90px] pb-0 border-t border-neutral-800">
        <h2 className="text-[32px] leading-[40px] font-normal mb-6">
          Everlane On You
        </h2>
        <div className="space-y-1">
          <p className="text-sm leading-[16.8px] tracking-[1.4px]">
            Share your latest look with #EverlaneOnYou for a chance to be
            featured.
          </p>
          <p className="text-sm leading-5 tracking-[1.4px] underline cursor-pointer hover:opacity-70">
            Add Your Photo
          </p>
        </div>
      </div>

      {/* Gallery */}
      <div className="px-10 flex items-center gap-[18px]">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <HiChevronLeft className="w-6 h-6" />
        </button>

        {/* Images */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2.5 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-[225.6px] h-[225px] flex-shrink-0 bg-gray-200 animate-pulse"
              ></div>
            ))
          ) : products.length > 0 ? (
            products.slice(0, 8).map((product) => {
              // Handle both card mode (primary_image) and full mode (images array)
              const mainImage =
                product.primary_image ||
                product.images?.find((img) => img.is_primary)?.image_url ||
                product.images?.[0]?.image_url ||
                "https://via.placeholder.com/225";

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="relative w-[225.6px] h-[225px] flex-shrink-0 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/225?text=" +
                        encodeURIComponent(product.name);
                    }}
                  />
                </Link>
              );
            })
          ) : (
            <div className="flex items-center justify-center w-full h-[225px] text-gray-400">
              No products available
            </div>
          )}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <HiChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}

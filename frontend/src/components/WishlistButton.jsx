import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";
import { useWishlist } from "../context/WishlistContext";

const WishlistButton = ({
  productId,
  productData = null,
  className = "",
  size = "md",
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const isFavorite = isInWishlist(productId);

  const handleClick = async (e) => {
    e.preventDefault(); // Prevent navigation if inside a Link
    e.stopPropagation(); // Stop event bubbling
    e.nativeEvent.stopImmediatePropagation(); // Stop all event propagation

    if (isLoading) return;

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login?from=" + encodeURIComponent(window.location.pathname));
      return;
    }

    setIsLoading(true);
    try {
      await toggleWishlist(productId, productData);
    } finally {
      setIsLoading(false);
    }
  };

  // Size configurations
  const sizes = {
    sm: "w-6 h-6 text-base",
    md: "w-8 h-8 text-lg",
    lg: "w-10 h-10 text-xl",
  };

  const iconSize = sizes[size] || sizes.md;

  return (
    <button
      onClick={handleClick}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      disabled={isLoading}
      className={`
        ${iconSize}
        flex items-center justify-center
        rounded-full
        bg-white
        shadow-md
        hover:shadow-lg
        transition-all
        duration-200
        relative
        z-10
        ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}
        ${className}
      `}
      title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
    >
      {isFavorite ? (
        <HiHeart
          className={`${
            size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"
          } text-red-500`}
        />
      ) : (
        <HiOutlineHeart
          className={`${
            size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"
          } text-gray-700`}
        />
      )}
    </button>
  );
};

export default WishlistButton;

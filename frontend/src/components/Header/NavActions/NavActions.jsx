import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiMagnifyingGlass,
  HiUser,
  HiShoppingCart,
  HiOutlineHeart,
  HiShoppingBag,
  HiArrowRightOnRectangle,
} from "react-icons/hi2";
import { Dropdown, Menu } from "antd";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import authService from "../../../services/authService";
import { message } from "antd";
import { SUCCESS_MESSAGES } from "../../../constants/messages";

export default function NavActions({ mobile = false, onActionClick = () => {} }) {
  const { setIsCartOpen, getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  // Check if user is logged in and watch for changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const isAuth = !!token;
      setIsLoggedIn(isAuth);

      // Get user name and avatar if logged in
      if (isAuth) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setUserName(user.full_name || "");
            setUserAvatar(user.avatar_url || "");
          } catch (e) {
            console.error("Error parsing user data:", e);
            setUserName("");
            setUserAvatar("");
          }
        }
      } else {
        setUserName("");
        setUserAvatar("");
      }
    };

    checkAuth();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for same-tab changes
    const interval = setInterval(checkAuth, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      message.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
      navigate("/");
      // Reload to update the UI
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage and redirect even if API fails
      setIsLoggedIn(false);
      navigate("/");
      window.location.reload();
    }
  };

  // Menu items for dropdown
  const menuItems = [
    {
      key: "profile",
      label: "Tài khoản của tôi",
      onClick: () => {
        navigate("/profile");
        onActionClick();
      },
    },
    {
      key: "orders",
      label: "Lịch sử đặt hàng",
      onClick: () => {
        navigate("/orders");
        onActionClick();
      },
    },
    {
      key: "logout",
      label: "Đăng xuất",
      style: {
        color: "#D0021B",
      },
      onClick: () => {
        handleLogout();
        onActionClick();
      },
    },
  ];

  // Mobile view - vertical list with labels
  if (mobile) {
    return (
      <div className="flex flex-col space-y-2">
        <Link
          to="/search"
          onClick={onActionClick}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <HiMagnifyingGlass className="w-5 h-5" />
          <span className="text-sm font-medium">Tìm kiếm</span>
        </Link>

        {isLoggedIn ? (
          <>
            {/* Account */}
            <button
              onClick={() => {
                navigate("/profile");
                onActionClick();
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left w-full"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-5 h-5 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <HiUser className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{userName || "Tài khoản"}</span>
            </button>

            {/* Orders */}
            <button
              onClick={() => {
                navigate("/orders");
                onActionClick();
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left w-full"
            >
              <HiShoppingBag className="w-5 h-5" />
              <span className="text-sm font-medium">Lịch sử đặt hàng</span>
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              onClick={onActionClick}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiOutlineHeart className="w-5 h-5" />
              <span className="text-sm font-medium">Yêu thích</span>
              {wishlistCount > 0 && (
                <span className="ml-auto bg-[#D0021B] text-white text-xs font-semibold rounded-full px-2 py-0.5">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <button
              onClick={() => {
                setIsCartOpen(true);
                onActionClick();
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left w-full"
            >
              <HiShoppingCart className="w-5 h-5" />
              <span className="text-sm font-medium">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="ml-auto bg-[#D0021B] text-white text-xs font-semibold rounded-full px-2 py-0.5">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                handleLogout();
                onActionClick();
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left w-full text-[#D0021B]"
            >
              <HiArrowRightOnRectangle className="w-5 h-5" />
              <span className="text-sm font-medium">Đăng xuất</span>
            </button>
          </>
        ) : (
          <>
            {/* Login */}
            <button
              onClick={() => {
                navigate("/login");
                onActionClick();
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left w-full"
            >
              <HiUser className="w-5 h-5" />
              <span className="text-sm font-medium">Đăng nhập</span>
            </button>

            {/* Signup */}
            <button
              onClick={() => {
                navigate("/signup");
                onActionClick();
              }}
              className="flex items-center gap-3 px-4 py-3 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors text-left w-full"
            >
              <span className="text-sm font-medium">Đăng ký</span>
            </button>
          </>
        )}
      </div>
    );
  }

  // Desktop view - horizontal icons
  return (
    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
      <Link
        to="/search"
        className="hover:opacity-70 transition-opacity"
        aria-label="Search"
      >
        <HiMagnifyingGlass className="w-5 h-5 sm:w-5 sm:h-5" />
      </Link>

      {isLoggedIn ? (
        <>
          {/* Account dropdown */}
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["hover"]}
            placement="bottomRight"
          >
            <button
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
              aria-label="Account"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "block";
                  }}
                />
              ) : null}
              <HiUser
                className="w-5 h-5"
                style={{ display: userAvatar ? "none" : "block" }}
              />
              {userName && (
                <span className="hidden sm:inline text-sm font-medium text-black max-w-[100px] truncate">
                  {userName}
                </span>
              )}
            </button>
          </Dropdown>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="hover:opacity-70 transition-opacity relative"
            aria-label="Wishlist"
          >
            <HiOutlineHeart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D0021B] text-white text-xs font-[600] rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Shopping Cart */}
          <button
            className="hover:opacity-70 transition-opacity relative"
            aria-label="Shopping Cart"
            onClick={() => setIsCartOpen(true)}
          >
            <HiShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D0021B] text-white text-xs font-[600] rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </>
      ) : (
        <>
          {/* Login and Signup buttons */}
          <button
            onClick={() => navigate("/login")}
            className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-black hover:opacity-70 transition-opacity"
          >
            <span className="hidden sm:inline">Đăng nhập</span>
            <HiUser className="w-5 h-5 sm:hidden" />
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors rounded"
          >
            <span className="hidden sm:inline">Đăng ký</span>
            <span className="sm:hidden">+</span>
          </button>
        </>
      )}
    </div>
  );
}

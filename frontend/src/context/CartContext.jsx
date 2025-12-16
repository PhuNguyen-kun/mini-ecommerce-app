import { createContext, useContext, useState, useEffect } from "react";
import cartService from "../services/cartService";
import { message } from "antd";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Helper function to format cart items from API response
const formatCartItems = (cartItems) => {
  if (!cartItems || !Array.isArray(cartItems)) return [];

  return cartItems.map((item) => {
    const variant = item.variant;
    const product = variant?.product;

    // Extract size and color from option values
    let selectedSize = null;
    let selectedColor = null;

    if (variant?.option_values) {
      variant.option_values.forEach((optVal) => {
        const optionName = optVal.option?.name?.toLowerCase();
        if (optionName === "kích cỡ" || optionName === "size") {
          selectedSize = optVal.value;
        } else if (optionName === "màu sắc" || optionName === "color") {
          selectedColor = optVal.value;
        }
      });
    }

    // Extract product info but exclude id to preserve cart_item.id
    const { id: productId, ...productWithoutId } = product || {};

    return {
      id: item.id, // cart_item.id - MUST be preserved
      cartId: item.id, // For backward compatibility
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price),
      // Product info (without id to avoid override)
      ...productWithoutId,
      productId: productId, // Store product id separately if needed
      // Variant info
      selectedVariant: variant,
      selectedSize,
      selectedColor,
    };
  });
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart from API when user is logged in
  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCart([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await cartService.getCart();
      if (response.success && response.data) {
        const formattedItems = formatCartItems(response.data.items || []);
        setCart(formattedItems);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart on mount and when user logs in
  useEffect(() => {
    fetchCart();
  }, []);

  // Watch for token changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      if (token) {
        fetchCart();
      } else {
        setCart([]);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for same-tab changes
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      const currentToken = token;
      if (currentToken !== (window._lastCartToken || null)) {
        window._lastCartToken = currentToken;
        handleStorageChange();
      }
    }, 500);

    window._lastCartToken = localStorage.getItem("token");

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const addToCart = async (productVariantId, quantity = 1) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await cartService.addToCart(productVariantId, quantity);
      if (response.success && response.data) {
        const formattedItems = formatCartItems(response.data.items || []);
        setCart(formattedItems);
        setIsCartOpen(true);
        message.success("Đã thêm vào giỏ hàng");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      message.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
      throw error;
    }
  };

  const removeFromCart = async (cartItemId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await cartService.removeFromCart(cartItemId);
      if (response.success && response.data) {
        const formattedItems = formatCartItems(response.data.items || []);
        setCart(formattedItems);
        message.success("Đã xóa khỏi giỏ hàng");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      message.error("Có lỗi xảy ra khi xóa khỏi giỏ hàng");
      throw error;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) {
      await removeFromCart(cartItemId);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await cartService.updateCartItem(cartItemId, quantity);
      if (response.success && response.data) {
        const formattedItems = formatCartItems(response.data.items || []);
        setCart(formattedItems);
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
      message.error("Có lỗi xảy ra khi cập nhật số lượng");
      throw error;
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await cartService.clearCart();
      if (response.success && response.data) {
        const formattedItems = formatCartItems(response.data.items || []);
        setCart(formattedItems);
        message.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      message.error("Có lỗi xảy ra khi xóa giỏ hàng");
      throw error;
    }
  };

  const getCartTotal = () => {
    const total = cart.reduce((sum, item) => {
      const price =
        item.unit_price || item.selectedVariant?.price || item.price || 0;
      return sum + price * item.quantity;
    }, 0);
    return total;
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isLoading,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

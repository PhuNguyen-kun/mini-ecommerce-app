import { API_ENDPOINTS } from "../config/api";

class CartService {
  /**
   * Get user's cart
   * @returns {Promise} Cart data
   */
  async getCart() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(API_ENDPOINTS.CART.GET, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  }

  /**
   * Add item to cart
   * @param {number} productVariantId - Product variant ID
   * @param {number} quantity - Quantity to add
   * @returns {Promise} Response data
   */
  async addToCart(productVariantId, quantity = 1) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(API_ENDPOINTS.CART.ADD, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_variant_id: productVariantId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }

  /**
   * Update cart item quantity
   * @param {number} cartItemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise} Response data
   */
  async updateCartItem(cartItemId, quantity) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(API_ENDPOINTS.CART.UPDATE(cartItemId), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   * @param {number} cartItemId - Cart item ID
   * @returns {Promise} Response data
   */
  async removeFromCart(cartItemId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(API_ENDPOINTS.CART.REMOVE(cartItemId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  }

  /**
   * Clear cart
   * @returns {Promise} Response data
   */
  async clearCart() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(API_ENDPOINTS.CART.CLEAR, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }
}

export default new CartService();

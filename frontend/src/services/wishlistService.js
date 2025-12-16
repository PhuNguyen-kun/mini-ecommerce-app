import { API_ENDPOINTS } from '../config/api';

class WishlistService {
  /**
   * Get user's wishlist
   * @returns {Promise} Wishlist data
   */
  async getWishlist() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.WISHLIST.LIST, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  }

  /**
   * Toggle product in wishlist (add/remove)
   * @param {number} productId - Product ID to toggle
   * @returns {Promise} Response data
   */
  async toggleWishlist(productId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.WISHLIST.TOGGLE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: productId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      throw error;
    }
  }
}

export default new WishlistService();

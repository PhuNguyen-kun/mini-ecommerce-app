import { API_ENDPOINTS } from '../config/api';

class AdminService {
  /**
   * Get dashboard statistics
   * @returns {Promise} Dashboard stats data
   */
  async getDashboardStats() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.DASHBOARD_STATS, {
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
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Create new product
   * @param {Object} productData - Product data including options and variants
   * @returns {Promise} Created product data
   */
  async createProduct(productData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(API_ENDPOINTS.ADMIN.PRODUCTS.CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Server validation error:', error);
        throw new Error(error.message || 'Failed to create product');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      console.error('Product data sent:', productData);
      throw error;
    }
  }

  /**
   * Upload media for product
   * @param {number} productId - Product ID
   * @param {FormData} formData - Form data containing images/videos
   * @returns {Promise} Upload result
   */
  async uploadProductMedia(productId, formData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(API_ENDPOINTS.ADMIN.PRODUCTS.UPLOAD_MEDIA(productId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload media');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }

  /**
   * Assign images to option values (colors)
   * @param {Array} pairs - Array of {imageId, optionValueId} pairs
   * @returns {Promise} Assignment result
   */
  async assignImagesToOptions(pairs) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(API_ENDPOINTS.ADMIN.PRODUCTS.ASSIGN_IMAGES, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pairs })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign images');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning images:', error);
      throw error;
    }
  }

  /**
   * Delete product image
   * @param {number} imageId - Image ID
   * @returns {Promise} Delete result
   */
  async deleteProductImage(imageId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(API_ENDPOINTS.ADMIN.PRODUCTS.DELETE_IMAGE(imageId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  /**
   * Delete product video
   * @param {number} videoId - Video ID
   * @returns {Promise} Delete result
   */
  async deleteProductVideo(videoId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(API_ENDPOINTS.ADMIN.PRODUCTS.DELETE_VIDEO(videoId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete video');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  /**
   * Delete product
   * @param {number} productId - Product ID
   * @returns {Promise} Delete result
   */
  async deleteProduct(productId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

     

      const response = await fetch(API_ENDPOINTS.ADMIN.PRODUCTS.DELETE(productId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

 

      if (!response.ok) {
        const error = await response.json();
        console.error('Delete failed:', error);
        throw new Error(error.message || 'Failed to delete product');
      }

      const result = await response.json();

      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Update product
   * @param {number} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise} Updated product data
   */
  async updateProduct(productId, productData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');



      const response = await fetch(API_ENDPOINTS.ADMIN.PRODUCTS.UPDATE(productId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const responseData = await response.json();
   

      if (!response.ok) {
        console.error('=== BACKEND ERROR ===');
        console.error('Status:', response.status);
        console.error('Error details:', responseData.details);
        throw new Error(responseData.message || 'Failed to update product');
      }

      return responseData;
    } catch (error) {
      console.error('=== CATCH ERROR ===');
      console.error(error);
      throw error;
    }
  }
}

export default new AdminService();


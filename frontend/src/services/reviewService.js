import { API_ENDPOINTS } from '../config/api';

class ReviewService {
  /**
   * Kiểm tra user có thể review product không
   * @param {number} productId - ID của sản phẩm
   * @returns {Promise} Response data with eligibility info
   */
  async checkEligibility(productId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          data: {
            canReview: false,
            message: 'Đăng nhập để đánh giá sản phẩm'
          }
        };
      }

      const response = await fetch(API_ENDPOINTS.REVIEWS.CHECK_ELIGIBILITY(productId), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check eligibility');
      }

      return data;
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      throw error;
    }
  }

  /**
   * Tạo review mới
   * @param {FormData} formData - Form data chứa review info và files
   * @returns {Promise} Response data with created review
   */
  async createReview(formData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Bạn cần đăng nhập để viết đánh giá');
      }

      const response = await fetch(API_ENDPOINTS.REVIEWS.CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create review');
      }

      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách reviews của product
   * @param {number} productId - ID của sản phẩm
   * @param {Object} params - Query parameters (page, limit, sort, filter, rating)
   * @returns {Promise} Response data with reviews list
   */
  async getProductReviews(productId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.filter) queryParams.append('filter', params.filter);
      if (params.rating) queryParams.append('rating', params.rating);

      const url = `${API_ENDPOINTS.REVIEWS.PRODUCT_REVIEWS(productId)}?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reviews');
      }

      return data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê reviews của product
   * @param {number} productId - ID của sản phẩm
   * @returns {Promise} Response data with review stats
   */
  async getProductReviewStats(productId) {
    try {
      const response = await fetch(API_ENDPOINTS.REVIEWS.PRODUCT_STATS(productId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch review stats');
      }

      return data;
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }
  }

  /**
   * Cập nhật review
   * @param {number} reviewId - ID của review
   * @param {FormData} formData - Form data chứa review info và files
   * @returns {Promise} Response data with updated review
   */
  async updateReview(reviewId, formData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Bạn cần đăng nhập để cập nhật đánh giá');
      }

      const response = await fetch(API_ENDPOINTS.REVIEWS.UPDATE(reviewId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type, let browser set it with boundary for multipart/form-data
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update review');
      }

      return data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  /**
   * Xóa review
   * @param {number} reviewId - ID của review
   * @returns {Promise} Response data
   */
  async deleteReview(reviewId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Bạn cần đăng nhập để xóa đánh giá');
      }

      const response = await fetch(API_ENDPOINTS.REVIEWS.DELETE(reviewId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete review');
      }

      return data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Lấy reviews của user hiện tại
   * @param {Object} params - Query parameters (page, limit)
   * @returns {Promise} Response data with user's reviews
   */
  async getMyReviews(params = {}) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Bạn cần đăng nhập để xem đánh giá của mình');
      }

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = `${API_ENDPOINTS.REVIEWS.MY_REVIEWS}?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch my reviews');
      }

      return data;
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      throw error;
    }
  }
}

export default new ReviewService();

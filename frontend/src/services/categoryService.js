import { API_ENDPOINTS } from '../config/api';

class CategoryService {
  /**
   * Get all categories (Public)
   * @returns {Promise} Categories data
   */
  async getCategories() {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORIES.LIST);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get category by slug (Public)
   * @param {string} slug - Category slug
   * @returns {Promise} Category data
   */
  async getCategoryBySlug(slug) {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORIES.DETAIL(slug));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  // ==================== ADMIN METHODS ====================

  /**
   * [ADMIN] Get all categories with pagination and filters
   * @param {Object} params - Query params { page, limit, search, is_active, parent_id }
   * @returns {Promise} Categories data with pagination
   */
  async getAdminCategories(params = {}) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active);
      if (params.parent_id !== undefined) queryParams.append('parent_id', params.parent_id);

      const url = `${API_ENDPOINTS.ADMIN.CATEGORIES.LIST}?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch categories');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching admin categories:', error);
      throw error;
    }
  }

  /**
   * [ADMIN] Get category tree structure
   * @returns {Promise} Tree structured categories
   */
  async getCategoryTree() {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(API_ENDPOINTS.ADMIN.CATEGORIES.TREE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch category tree');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching category tree:', error);
      throw error;
    }
  }

  /**
   * [ADMIN] Get category statistics
   * @returns {Promise} Category stats
   */
  async getCategoryStats() {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(API_ENDPOINTS.ADMIN.CATEGORIES.STATS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch category stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw error;
    }
  }

  /**
   * [ADMIN] Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise} Category data
   */
  async getCategoryById(id) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(API_ENDPOINTS.ADMIN.CATEGORIES.DETAIL(id), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch category');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  /**
   * [ADMIN] Create new category
   * @param {Object} categoryData - { name, description, parent_id, is_active }
   * @returns {Promise} Created category
   */
  async createCategory(categoryData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(API_ENDPOINTS.ADMIN.CATEGORIES.CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create category');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * [ADMIN] Update category
   * @param {number} id - Category ID
   * @param {Object} categoryData - { name, description, parent_id, is_active }
   * @returns {Promise} Updated category
   */
  async updateCategory(id, categoryData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(API_ENDPOINTS.ADMIN.CATEGORIES.UPDATE(id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update category');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * [ADMIN] Delete category
   * @param {number} id - Category ID
   * @returns {Promise} Delete result
   */
  async deleteCategory(id) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(API_ENDPOINTS.ADMIN.CATEGORIES.DELETE(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete category');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * [ADMIN] Toggle category active status
   * @param {number} id - Category ID
   * @param {boolean} isActive - Active status
   * @returns {Promise} Updated category
   */
  async toggleCategoryActive(id, isActive) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(API_ENDPOINTS.ADMIN.CATEGORIES.TOGGLE_ACTIVE(id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: isActive })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to toggle category status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling category status:', error);
      throw error;
    }
  }
}

export default new CategoryService();

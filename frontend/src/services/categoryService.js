import { API_ENDPOINTS } from '../config/api';

class CategoryService {
  /**
   * Get all categories
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
   * Get category by slug
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
}

export default new CategoryService();

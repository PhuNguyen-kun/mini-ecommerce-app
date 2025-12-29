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
}

export default new AdminService();


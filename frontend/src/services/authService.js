import { API_ENDPOINTS } from '../config/api';

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.full_name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {string} [userData.phone] - User's phone number (optional)
   * @returns {Promise} Response data with user and token
   */
  async register(userData) {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON (network error, etc.)
        throw new Error('Network error. Please check your connection and try again.');
      }

      if (!response.ok) {
        // Handle validation errors or other errors
        const errorMessage = data.errors && Array.isArray(data.errors) 
          ? data.errors.join(', ') 
          : data.message || 'Registration failed';
        throw new Error(errorMessage);
      }

      // Store token in localStorage
      if (data.data && data.data.token) {
        localStorage.setItem('token', data.data.token);
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
      }

      return data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} Response data with user and token
   */
  async login(email, password) {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON (network error, etc.)
        throw new Error('Network error. Please check your connection and try again.');
      }

      if (!response.ok) {
        // Handle authentication errors
        const errorMessage = data.errors && Array.isArray(data.errors)
          ? data.errors.join(', ')
          : data.message || 'Login failed';
        throw new Error(errorMessage);
      }

      // Store token in localStorage
      if (data.data && data.data.token) {
        localStorage.setItem('token', data.data.token);
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
      }

      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Promise} Response data
   */
  async logout() {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Logout failed');
        }
      }

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      // Clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  }

  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  async getProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
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
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
}

export default new AuthService();


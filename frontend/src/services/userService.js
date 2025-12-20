import { API_ENDPOINTS } from '../config/api';

class UserService {
  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @param {string} [profileData.full_name] - User's full name
   * @param {string} [profileData.phone] - User's phone number
   * @returns {Promise} Updated user data
   */
  async updateProfile(profileData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.USERS.UPDATE_PROFILE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Network error. Please check your connection and try again.');
      }

      if (!response.ok) {
        const errorMessage = data.errors && typeof data.errors === 'object'
          ? Object.values(data.errors).join(', ')
          : data.message || 'Update profile failed';
        throw new Error(errorMessage);
      }

      // Update user in localStorage
      if (data.data) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Upload user avatar
   * @param {File} avatarFile - Avatar image file
   * @returns {Promise} Updated user data with new avatar
   */
  async uploadAvatar(avatarFile) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await fetch(API_ENDPOINTS.USERS.UPLOAD_AVATAR, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Network error. Please check your connection and try again.');
      }

      if (!response.ok) {
        const errorMessage = data.message || 'Upload avatar failed';
        throw new Error(errorMessage);
      }

      // Update user in localStorage
      if (data.data) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return data;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  /**
   * Delete user avatar
   * @returns {Promise} Updated user data without avatar
   */
  async deleteAvatar() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.USERS.DELETE_AVATAR, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Network error. Please check your connection and try again.');
      }

      if (!response.ok) {
        const errorMessage = data.message || 'Delete avatar failed';
        throw new Error(errorMessage);
      }

      // Update user in localStorage
      if (data.data) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return data;
    } catch (error) {
      console.error('Error deleting avatar:', error);
      throw error;
    }
  }
}

export default new UserService();

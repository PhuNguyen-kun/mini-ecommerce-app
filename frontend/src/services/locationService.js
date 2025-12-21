import { API_ENDPOINTS } from '../config/api';

class LocationService {
  async getProvinces() {
    try {
      const response = await fetch(API_ENDPOINTS.LOCATIONS.PROVINCES);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  }

  async getDistricts(provinceId) {
    try {
      const response = await fetch(API_ENDPOINTS.LOCATIONS.DISTRICTS(provinceId));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  }

  async getWards(districtId) {
    try {
      const response = await fetch(API_ENDPOINTS.LOCATIONS.WARDS(districtId));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  }
}

export default new LocationService();


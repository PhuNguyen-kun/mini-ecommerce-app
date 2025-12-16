// API Base URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    PROFILE: `${API_BASE_URL}/auth/me`,
  },
  
  // Products
  PRODUCTS: {
    LIST: `${API_BASE_URL}/products`,
    DETAIL: (slug) => `${API_BASE_URL}/products/${slug}`,
  },

  // Categories
  CATEGORIES: {
    LIST: `${API_BASE_URL}/categories`,
    DETAIL: (slug) => `${API_BASE_URL}/categories/${slug}`,
  },

  // Wishlist
  WISHLIST: {
    LIST: `${API_BASE_URL}/wishlist`,
    TOGGLE: `${API_BASE_URL}/wishlist/toggle`,
  },
};

export default API_BASE_URL;

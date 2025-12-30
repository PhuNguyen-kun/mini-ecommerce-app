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

  // Users
  USERS: {
    UPDATE_PROFILE: `${API_BASE_URL}/users/me`,
    UPLOAD_AVATAR: `${API_BASE_URL}/users/me/avatar`,
    DELETE_AVATAR: `${API_BASE_URL}/users/me/avatar`,
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

  // Cart
  CART: {
    GET: `${API_BASE_URL}/cart`,
    ADD: `${API_BASE_URL}/cart/add`,
    UPDATE: (cartItemId) => `${API_BASE_URL}/cart/item/${cartItemId}`,
    REMOVE: (cartItemId) => `${API_BASE_URL}/cart/item/${cartItemId}`,
    CLEAR: `${API_BASE_URL}/cart/clear`,
  },

  // Locations
  LOCATIONS: {
    PROVINCES: `${API_BASE_URL}/locations/provinces`,
    DISTRICTS: (provinceId) => `${API_BASE_URL}/locations/districts/${provinceId}`,
    WARDS: (districtId) => `${API_BASE_URL}/locations/wards/${districtId}`,
  },

  // Reviews
  REVIEWS: {
    CHECK_ELIGIBILITY: (productId) => `${API_BASE_URL}/reviews/check-eligibility/${productId}`,
    CREATE: `${API_BASE_URL}/reviews`,
    PRODUCT_REVIEWS: (productId) => `${API_BASE_URL}/reviews/product/${productId}`,
    PRODUCT_STATS: (productId) => `${API_BASE_URL}/reviews/product/${productId}/stats`,
    UPDATE: (reviewId) => `${API_BASE_URL}/reviews/${reviewId}`,
    DELETE: (reviewId) => `${API_BASE_URL}/reviews/${reviewId}`,
    MY_REVIEWS: `${API_BASE_URL}/reviews/my-reviews`,
  },

  // Admin
  ADMIN: {
    DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard/stats`,
    PRODUCTS: {
      CREATE: `${API_BASE_URL}/admin/products`,
      UPDATE: (id) => `${API_BASE_URL}/admin/products/${id}`,
      DELETE: (id) => `${API_BASE_URL}/admin/products/${id}`,
      UPLOAD_MEDIA: (id) => `${API_BASE_URL}/admin/products/${id}/media`,
      DELETE_IMAGE: (id) => `${API_BASE_URL}/admin/products/images/${id}`,
      DELETE_VIDEO: (id) => `${API_BASE_URL}/admin/products/videos/${id}`,
      ASSIGN_IMAGES: `${API_BASE_URL}/admin/products/options/image`,
    },
  },
};

export default API_BASE_URL;

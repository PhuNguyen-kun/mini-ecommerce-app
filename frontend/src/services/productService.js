import { API_ENDPOINTS } from '../config/api';

class ProductService {
  /**
   * Get products list with filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.gender - 'male' or 'female'
   * @param {string} params.search - Search query
   * @param {number} params.category_id - Category ID
   * @param {string} params.sort - Sort option
   * @param {number} params.min_price - Minimum price
   * @param {number} params.max_price - Maximum price
   * @param {string} params.colors - Comma-separated colors
   * @param {string} params.sizes - Comma-separated sizes
   */
  async getProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const url = `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get product detail by slug
   * @param {string} slug - Product slug
   */
  async getProductBySlug(slug) {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCTS.DETAIL(slug));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product detail:', error);
      throw error;
    }
  }

  /**
   * Get available filters (colors, sizes, categories) for current gender
   * @param {string} gender - 'male' or 'female'
   */
  async getAvailableFilters(gender) {
    try {
      // Get all products with full data to extract unique colors and sizes
      const response = await fetch(`${API_ENDPOINTS.PRODUCTS.LIST}?gender=${gender}&limit=1000&view=full`);
      
      if (!response.ok) {
        console.error('Filter fetch failed with status:', response.status);
        return { colors: [], sizes: [], categories: [] };
      }
      
      const data = await response.json();
      console.log('Filter response:', data); // Debug log
      
      if (!data.success || !data.data || !data.data.products) {
        console.error('Invalid filter response structure:', data);
        return { colors: [], sizes: [], categories: [] };
      }
      
      const products = data.data.products;
      console.log('Number of products for filters:', products.length); // Debug log
      
      const colorsMap = new Map(); // { colorName: count }
      const sizesMap = new Map(); // { sizeName: count }
      const categoriesMap = new Map();
      
      products.forEach(product => {
        // Extract categories
        if (product.category) {
          const catId = product.category.id;
          if (categoriesMap.has(catId)) {
            categoriesMap.get(catId).count++;
          } else {
            categoriesMap.set(catId, {
              id: product.category.id,
              name: product.category.name,
              slug: product.category.slug,
              count: 1
            });
          }
        }
        
        // Track which colors and sizes exist in this product
        const productColors = new Set();
        const productSizes = new Set();
        
        // Extract colors and sizes from variants
        if (product.variants && Array.isArray(product.variants)) {
          product.variants.forEach(variant => {
            if (variant.option_values && Array.isArray(variant.option_values)) {
              variant.option_values.forEach(optVal => {
                // Check both possible structures
                const optionName = (optVal.option?.name || optVal.ProductOption?.name || '').toLowerCase();
                const value = optVal.value;
                
                if (!value) return;
                
                if (optionName.includes('color') || optionName.includes('màu')) {
                  productColors.add(value);
                } else if (optionName.includes('size') || optionName.includes('kích')) {
                  productSizes.add(value);
                }
              });
            }
          });
        }
        
        // Count products for each color
        productColors.forEach(color => {
          colorsMap.set(color, (colorsMap.get(color) || 0) + 1);
        });
        
        // Count products for each size
        productSizes.forEach(size => {
          sizesMap.set(size, (sizesMap.get(size) || 0) + 1);
        });
      });
      
      // Convert maps to arrays with count
      const colors = Array.from(colorsMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      const sizes = Array.from(sizesMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => {
          // Custom sort for sizes (XS, S, M, L, XL, XXL)
          const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
          const aIndex = sizeOrder.indexOf(a.name.toUpperCase());
          const bIndex = sizeOrder.indexOf(b.name.toUpperCase());
          
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
      
      const categories = Array.from(categoriesMap.values())
        .sort((a, b) => b.count - a.count); // Sort by count descending
      
      console.log('Extracted filters:', { colors: colors.length, sizes: sizes.length, categories: categories.length }); // Debug log
      
      return { colors, sizes, categories };
    } catch (error) {
      console.error('Error fetching filters:', error);
      return { colors: [], sizes: [], categories: [] };
    }
  }
}

export default new ProductService();

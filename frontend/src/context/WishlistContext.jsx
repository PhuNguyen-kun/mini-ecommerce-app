import { createContext, useContext, useState, useEffect } from 'react';
import wishlistService from '../services/wishlistService';
import { message } from 'antd';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load wishlist from localStorage (for non-logged in users)
  const loadLocalWishlist = () => {
    const saved = localStorage.getItem('wishlist_local');
    return saved ? JSON.parse(saved) : [];
  };

  // Save wishlist to localStorage (for non-logged in users)
  const saveLocalWishlist = (data) => {
    localStorage.setItem('wishlist_local', JSON.stringify(data));
  };

  // Fetch wishlist when component mounts
  const fetchWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Load from localStorage if not logged in
      const localWishlist = loadLocalWishlist();
      setWishlist(localWishlist);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await wishlistService.getWishlist();
      if (response.success) {
        setWishlist(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err.message);
      // Fallback to local storage
      const localWishlist = loadLocalWishlist();
      setWishlist(localWishlist);
    } finally {
      setIsLoading(false);
    }
  };

  // Load wishlist on mount and when user logs in
  useEffect(() => {
    fetchWishlist();
  }, []);

  // Check if a product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId || item.product?.id === productId);
  };

  // Toggle wishlist (add/remove)
  const toggleWishlist = async (productId, productData = null) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Handle wishlist locally when not logged in
        const localWishlist = loadLocalWishlist();
        const existingIndex = localWishlist.findIndex(item => 
          item.product_id === productId || item.product?.id === productId
        );

        if (existingIndex > -1) {
          // Remove from wishlist
          localWishlist.splice(existingIndex, 1);
          saveLocalWishlist(localWishlist);
          setWishlist(localWishlist);
          message.success('Đã xóa khỏi danh sách yêu thích');
          return { success: true, message: 'Removed from wishlist' };
        } else {
          // Add to wishlist
          const newItem = {
            id: Date.now(),
            product_id: productId,
            product: productData,
            created_at: new Date().toISOString()
          };
          localWishlist.push(newItem);
          saveLocalWishlist(localWishlist);
          setWishlist(localWishlist);
          message.success('Đã thêm vào danh sách yêu thích');
          return { success: true, message: 'Added to wishlist' };
        }
      }

      // Handle with API when logged in
      const response = await wishlistService.toggleWishlist(productId);
      
      if (response.success) {
        // Refresh wishlist after toggle
        await fetchWishlist();
        
        // Show notification
        if (response.data?.message?.includes('added') || response.message?.includes('added')) {
          message.success('Đã thêm vào danh sách yêu thích');
        } else {
          message.success('Đã xóa khỏi danh sách yêu thích');
        }
        
        return response;
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      setError(err.message);
      message.error('Có lỗi xảy ra, vui lòng thử lại');
      return { success: false, message: err.message };
    }
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlist.length;
  };

  // Get wishlist products (formatted)
  const getWishlistProducts = () => {
    return wishlist
      .filter(item => item.product) // Filter out items without product data
      .map(item => ({
        ...item.product,
        wishlistId: item.id,
        addedAt: item.created_at
      }));
  };

  const value = {
    wishlist,
    isLoading,
    error,
    isInWishlist,
    toggleWishlist,
    fetchWishlist,
    getWishlistCount,
    getWishlistProducts
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

import { useState, useEffect, useMemo } from 'react';
import ProductCard from './ProductCard';
import productService from '../../../services/productService';

const ProductGrid = ({ category, onTotalChange, selectedFilters }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    total_pages: 0
  });
  const [sortBy, setSortBy] = useState('featured');

  // Create stable filter string to prevent unnecessary re-renders
  const filterKey = useMemo(() => {
    return JSON.stringify({
      categoryIds: selectedFilters?.categoryIds?.sort() || [],
      colors: selectedFilters?.colors?.sort() || [],
      sizes: selectedFilters?.sizes?.sort() || []
    });
  }, [selectedFilters]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const gender = category.toLowerCase() === 'men' ? 'male' : 'female';
        
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          gender: gender,
        };

        // Add sort
        if (sortBy === 'price_asc') params.sort = 'price_asc';
        if (sortBy === 'price_desc') params.sort = 'price_desc';
        if (sortBy === 'newest') params.sort = 'newest';
        if (sortBy === 'oldest') params.sort = 'oldest';

        // Add filters
        if (selectedFilters?.categoryIds?.length > 0) {
          params.category_ids = selectedFilters.categoryIds.join(',');
        }
        if (selectedFilters?.colors?.length > 0) {
          params.colors = selectedFilters.colors.join(',');
        }
        if (selectedFilters?.sizes?.length > 0) {
          params.sizes = selectedFilters.sizes.join(',');
        }

        const response = await productService.getProducts(params);
        
        if (response.success) {
          setProducts(response.data.products);
          setPagination(response.data.pagination);
          
          // Update total products count in parent
          if (onTotalChange) {
            onTotalChange(response.data.pagination.total);
          }
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, pagination.page, sortBy, filterKey]); // Use filterKey instead of selectedFilters

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filterKey]); // Use filterKey instead of selectedFilters

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-gray-600 mb-2">Home / {category}</p>
        <h1 className="text-[32px] font-semibold text-black mb-4">
          {category}'s Clothing & Apparel - New Arrivals
        </h1>
        <div className="flex items-center justify-between">
          <select 
            className="text-sm border-none outline-none cursor-pointer"
            value={sortBy}
            onChange={handleSortChange}
            disabled={loading}
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          {!loading && (
            <p className="text-sm text-gray-600">
              {pagination.total} products
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-3 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* No Products */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found.</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.total_pages}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

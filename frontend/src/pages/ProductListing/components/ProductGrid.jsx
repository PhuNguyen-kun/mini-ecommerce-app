import { useState, useEffect, useMemo } from 'react';
import { Pagination } from 'antd';
import ProductCard from './ProductCard';
import productService from '../../../services/productService';

const ProductGrid = ({ category, onTotalChange, selectedFilters }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const pageSize = 12;

  // Create stable filter string to prevent unnecessary re-renders
  const filterKey = useMemo(() => {
    return JSON.stringify({
      categoryIds: selectedFilters?.categoryIds?.sort() || [],
      colors: selectedFilters?.colors?.sort() || [],
      sizes: selectedFilters?.sizes?.sort() || []
    });
  }, [selectedFilters]);

  // Reset page when category, sort, or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, sortBy, filterKey]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const gender = category.toLowerCase() === 'men' ? 'male' : 'female';

        const params = {
          page: currentPage,
          limit: pageSize,
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
          setTotal(response.data.pagination.total);

          // Update total products count in parent
          if (onTotalChange) {
            onTotalChange(response.data.pagination.total);
          }
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Tải sản phẩm thất bại. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, currentPage, sortBy, filterKey, selectedFilters, onTotalChange]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <p className="text-xs text-gray-600 mb-2">Trang chủ / {category}</p>
        <h1 className="text-xl sm:text-2xl md:text-[28px] lg:text-[32px] font-semibold text-black mb-3 sm:mb-4">
          Quần Áo {category} - Hàng Mới Về
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <select
            className="text-sm border border-gray-300 rounded px-2 py-1 sm:border-none sm:outline-none cursor-pointer"
            value={sortBy}
            onChange={handleSortChange}
            disabled={loading}
          >
            <option value="featured">Nổi bật</option>
            <option value="price_asc">Giá: Thấp đến Cao</option>
            <option value="price_desc">Giá: Cao đến Thấp</option>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
          {!loading && (
            <p className="text-sm text-gray-600">
              {total} sản phẩm
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
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* No Products */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Không tìm thấy sản phẩm nào.</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && total > pageSize && (
        <div className="flex justify-center mt-12">
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            showTotal={(total, range) => `${range[0]}-${range[1]} trong tổng ${total} sản phẩm`}
          />
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

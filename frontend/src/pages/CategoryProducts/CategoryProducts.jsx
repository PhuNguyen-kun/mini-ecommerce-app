import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import productService from '../../services/productService';

const CategoryProducts = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  
  const [products, setProducts] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    total_pages: 0
  });

  // Fetch products by category
  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryId) return;
      
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: pagination.page,
          limit: pagination.limit,
          category_ids: categoryId,
        };

        const response = await productService.getProducts(params);
        
        if (response.success) {
          setProducts(response.data.products);
          setPagination(response.data.pagination);
          
          // Get category name from first product
          if (response.data.products.length > 0) {
            setCategoryInfo(response.data.products[0].category);
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
  }, [categoryId, pagination.page]);

  // Format price to VND
  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full min-h-screen">
      <div className="px-20 py-7">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-gray-600 mb-2">
            Home / {categoryInfo?.name || 'Products'}
          </p>
          <h1 className="text-[32px] font-semibold text-black mb-4">
            {categoryInfo?.name || 'Products'}
          </h1>
          <p className="text-sm text-gray-600">
            {pagination.total} {pagination.total === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-4 gap-5">
            {products.map((product) => {
              const primaryImage = product.images?.find(img => img.is_primary)?.image_url || 
                                  product.images?.[0]?.image_url || '/placeholder.png';
              const minPrice = product.variants?.reduce((min, variant) => 
                Math.min(min, variant.price), Infinity) || 0;

              return (
                <Link 
                  key={product.id}
                  to={`/product/${product.slug || product.id}`}
                  className="group cursor-pointer flex flex-col gap-2.5"
                >
                  {/* Image */}
                  <div className="relative w-full h-[350px] overflow-hidden bg-gray-100">
                    <img 
                      src={primaryImage} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        View Details
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-3 items-start">
                      <p className="flex-1 text-sm text-black leading-4 group-hover:underline">
                        {product.name}
                      </p>
                      <p className="text-sm text-black font-semibold">
                        {formatPrice(minPrice)}₫
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found in this category.</p>
            <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Home
            </Link>
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
    </div>
  );
};

export default CategoryProducts;

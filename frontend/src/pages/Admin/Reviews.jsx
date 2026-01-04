import { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, message } from 'antd';
import {
  FiStar,
  FiSearch,
  FiTrash2,
  FiEye,
  FiImage,
  FiVideo,
  FiCalendar,
  FiUser,
  FiPackage,
  FiBarChart2
} from 'react-icons/fi';
import reviewService from '../../services/reviewService';
import categoryService from '../../services/categoryService';
import ReviewDetailModal from '../../components/Admin/ReviewDetailModal';
import ProductReviewsModal from '../../components/Admin/ProductReviewsModal';
import ReviewStatsCards from '../../components/Admin/ReviewStatsCards';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Filters
  const [searchInput, setSearchInput] = useState(''); // Input value
  const [searchTerm, setSearchTerm] = useState(''); // Debounced value
  const [filterCategory, setFilterCategory] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Stats
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: {},
    reviewsWithImages: 0,
    reviewsWithVideos: 0
  });

  // Modal state
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Product Reviews Modal
  const [showProductReviewsModal, setShowProductReviewsModal] = useState(false);
  const [productReviewsList, setProductReviewsList] = useState([]);
  const [loadingProductReviews, setLoadingProductReviews] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchReviews();
  }, [currentPage, searchTerm, filterCategory, filterProduct, filterRating, sortBy]);

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        sort: sortBy
      };

      if (searchTerm) params.search = searchTerm;
      if (filterCategory) params.categoryId = filterCategory;
      if (filterProduct) params.productId = filterProduct;
      if (filterRating) params.rating = filterRating;

      const response = await reviewService.getAdminReviews(params);
      console.log('Reviews response:', response); // Debug log
      console.log('First review data:', response?.data?.[0]); // Debug first review structure

      if (response?.success) {
        setReviews(Array.isArray(response.data) ? response.data : []);
        setTotalReviews(response.pagination?.totalItems || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        console.warn('Invalid reviews response structure');
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Không thể tải danh sách đánh giá');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reviewService.getAdminStats();
      console.log('Stats response:', response); // Debug log

      if (response?.success && response?.data) {
        setStats(response.data);
      } else {
        console.warn('Invalid stats response structure');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      console.log('Categories response:', response);

      if (response?.success && Array.isArray(response?.data)) {
        setCategories(response.data);
      } else {
        console.warn('Invalid categories response structure');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const handleDelete = async (review) => {
    Modal.confirm({
      title: 'Xác nhận xóa đánh giá',
      content: (
        <div>
          <p>Bạn có chắc muốn xóa đánh giá này?</p>
          <p className="text-gray-600 mt-2">
            <strong>Người dùng:</strong> {review.user?.full_name}<br />
            <strong>Sản phẩm:</strong> {review.product?.name}<br />
            <strong>Rating:</strong> {review.rating}/5
          </p>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await reviewService.deleteAdminReview(review.id);
          message.success('Xóa đánh giá thành công');
          await Promise.all([fetchReviews(), fetchStats()]);
        } catch (error) {
          console.error('Error deleting review:', error);
          message.error(error.message || 'Không thể xóa đánh giá');
        }
      }
    });
  };

  const handleViewDetail = async (review) => {
    try {
      setLoadingDetail(true);
      setShowDetailModal(true); // Open modal immediately with loading state

      const response = await reviewService.getAdminReviewById(review.id);
      console.log('Review detail response:', response);

      if (response?.success && response?.data) {
        setSelectedReview(response.data);
      } else {
        console.warn('Invalid review detail response:', response);
        message.error('Không thể tải chi tiết đánh giá');
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error fetching review detail:', error);
      message.error(error.message || 'Không thể tải chi tiết đánh giá');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleViewProductReviews = async (productId) => {
    try {
      setLoadingProductReviews(true);
      setShowProductReviewsModal(true);

      // Get product info from current review
      if (selectedReview?.product) {
        setSelectedProduct(selectedReview.product);
      }

      // Fetch all reviews of this product
      const response = await reviewService.getAdminReviews({
        productId,
        page: 1,
        limit: 100, // Get more reviews for the modal
        sort: 'newest'
      });

      if (response?.success) {
        setProductReviewsList(Array.isArray(response.data) ? response.data : []);
      } else {
        setProductReviewsList([]);
      }
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      message.error('Không thể tải danh sách đánh giá sản phẩm');
      setProductReviewsList([]);
    } finally {
      setLoadingProductReviews(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Đánh giá</h1>
        <p className="text-gray-600">Xem và quản lý đánh giá sản phẩm từ khách hàng</p>
      </div>

      {/* Stats Cards */}
      <ReviewStatsCards stats={stats} />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm trong bình luận..."
              value={searchInput}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả danh mục</option>
              {Array.isArray(categories) && categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <select
              value={filterRating}
              onChange={(e) => {
                setFilterRating(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả rating</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
              <option value="4">⭐⭐⭐⭐ (4 sao)</option>
              <option value="3">⭐⭐⭐ (3 sao)</option>
              <option value="2">⭐⭐ (2 sao)</option>
              <option value="1">⭐ (1 sao)</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="rating_high">Rating cao → thấp</option>
              <option value="rating_low">Rating thấp → cao</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bình luận
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Media
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    Không có đánh giá nào
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    {/* User */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={review.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.full_name || "User")}&background=random`}
                            alt={review.user?.full_name || 'User'}
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.full_name || "User")}&background=random`;
                            }}
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {review.user?.full_name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {review.user?.email || ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {(() => {
                            // Lấy variant từ order items (review → order → items[0] → variant)
                            let colorOptionValueId = null;
                            const orderItem = review.order?.items?.find(item => item.variant?.product_id === review.product_id);
                            const variant = orderItem?.variant;

                            if (variant?.option_values) {
                              variant.option_values.forEach((optVal) => {
                                const optionName = optVal.option?.name?.toLowerCase();
                                if (
                                  optionName === "màu sắc" ||
                                  optionName === "color" ||
                                  optionName === "màu"
                                ) {
                                  colorOptionValueId = optVal.id;
                                }
                              });
                            }

                            // Tìm hình ảnh phù hợp với màu sắc
                            let productImage = null;
                            if (colorOptionValueId && review.product?.images) {
                              const colorImage = review.product.images.find(
                                (img) => img.product_option_value_id === colorOptionValueId
                              );
                              productImage = colorImage?.image_url;
                            }

                            // Fallback về hình đầu tiên nếu không tìm thấy
                            if (!productImage) {
                              productImage = review.product?.images?.[0]?.image_url;
                            }

                            return productImage ? (
                              <img
                                className="h-10 w-10 rounded object-cover"
                                src={productImage}
                                alt={review.product?.name}
                                loading="lazy"
                                onError={(e) => {
                                  e.target.src = review.product?.images?.[0]?.image_url || '/placeholder.png';
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                <FiPackage className="w-5 h-5 text-gray-500" />
                              </div>
                            );
                          })()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {review.product?.name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {renderStars(review.rating)}
                        <span className="text-sm font-medium text-gray-900">
                          {review.rating}/5
                        </span>
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-xs truncate">
                        {review.comment}
                      </p>
                    </td>

                    {/* Media */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {review.images && review.images.length > 0 && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <FiImage className="w-4 h-4" />
                            <span className="text-xs">{review.images.length}</span>
                          </div>
                        )}
                        {review.video_url && (
                          <div className="flex items-center gap-1 text-purple-600">
                            <FiVideo className="w-4 h-4" />
                            <span className="text-xs">1</span>
                          </div>
                        )}
                        {!review.images?.length && !review.video_url && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {formatDate(review.created_at)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(review)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(review)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{' '}
                  <span className="font-medium">
                    {(currentPage - 1) * 20 + 1}
                  </span>{' '}
                  đến{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 20, totalReviews)}
                  </span>{' '}
                  trong tổng số <span className="font-medium">{totalReviews}</span> đánh giá
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  {[...Array(Math.min(totalPages, 5))].map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === idx + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      <ReviewDetailModal
        review={selectedReview}
        visible={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedReview(null);
        }}
        onDelete={handleDelete}
        loading={loadingDetail}
        onViewProductReviews={handleViewProductReviews}
      />

      {/* Product Reviews List Modal */}
      <ProductReviewsModal
        visible={showProductReviewsModal}
        onClose={() => {
          setShowProductReviewsModal(false);
          setProductReviewsList([]);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        reviews={productReviewsList}
        loading={loadingProductReviews}
      />
    </div>
  );
};

export default Reviews;

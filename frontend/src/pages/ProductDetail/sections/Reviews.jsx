import { useState, useEffect } from "react";
import {
  Rate,
  Select,
  Button,
  Spin,
  Progress,
  Empty,
  Statistic,
  Space,
  Tag,
  message,
} from "antd";
import {
  StarFilled,
  PictureOutlined,
  VideoCameraOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import reviewService from "../../../services/reviewService";
import CreateReviewModal from "../../../components/reviews/CreateReviewModal";
import ReviewItem from "../../../components/reviews/ReviewItem";

const Reviews = ({ productId, autoOpenModal = false, onModalClose }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [selectedSort, setSelectedSort] = useState("newest");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedRating, setSelectedRating] = useState(null);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState("");

  // Check if user can review
  const checkEligibility = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCanReview(false);
      setEligibilityMessage("Đăng nhập để đánh giá sản phẩm");
      return;
    }

    try {
      const response = await reviewService.checkEligibility(productId);
      if (response.success) {
        setCanReview(response.data.canReview);
        setEligibilityMessage(response.data.message || "");
      }
    } catch (error) {
      setCanReview(false);
      setEligibilityMessage("Chỉ dành cho người đã mua");
    }
  };

  useEffect(() => {
    checkEligibility();
  }, [productId]);

  // Auto open modal when autoOpenModal prop is true and user can review
  useEffect(() => {
    if (autoOpenModal && canReview && !loading) {
      setShowCreateModal(true);
    }
  }, [autoOpenModal, canReview, loading]);

  // Fetch reviews and stats
  useEffect(() => {
    fetchData();
  }, [productId, page, selectedSort, selectedFilter, selectedRating]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsResponse = await reviewService.getProductReviewStats(
        productId
      );
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Fetch reviews
      const reviewsResponse = await reviewService.getProductReviews(productId, {
        page,
        limit: 10,
        sort: selectedSort,
        filter: selectedFilter,
        rating: selectedRating,
      });

      if (reviewsResponse.success) {
        // Reset reviews when page is 1 (filter changed)
        if (page === 1) {
          setReviews(reviewsResponse.data);
        } else {
          setReviews((prev) => [...prev, ...reviewsResponse.data]);
        }

        const pagination = reviewsResponse.pagination;
        setTotalPages(pagination.totalPages);
        setHasMore(pagination.page < pagination.totalPages);
      }
    } catch (error) {
      message.error("Không thể tải đánh giá. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCreated = () => {
    // Reload reviews and stats
    setPage(1);
    setReviews([]);
    fetchData();
    // Re-check eligibility to hide write button
    checkEligibility();
  };

  const renderStars = (rating) => {
    return <Rate disabled value={rating} />;
  };

  const getRatingPercentage = (rating) => {
    if (!stats || stats.totalReviews === 0) return 0;
    return ((stats.ratingBreakdown[rating] / stats.totalReviews) * 100).toFixed(
      0
    );
  };

  if (loading && !reviews.length) {
    return (
      <div className="px-3 sm:px-4 md:px-6 lg:px-10 xl:px-20 py-8 sm:py-12 md:py-16">
        <div className="text-center">
          <Spin size="large" tip="Đang tải đánh giá..." />
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-10 xl:px-20 py-8 sm:py-12 md:py-16">
      {/* Header */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">Đánh giá sản phẩm</h2>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8 bg-gray-50 p-4 sm:p-6 md:p-8 rounded-lg">
          {/* Overall Rating */}
          <div className="text-center">
            <Statistic
              value={stats.averageRating}
              precision={1}
              valueStyle={{ fontSize: "2rem", fontWeight: "bold" }}
              className="[&_.ant-statistic-content]:text-2xl sm:[&_.ant-statistic-content]:text-4xl md:[&_.ant-statistic-content]:text-5xl"
            />
            <div className="flex justify-center mb-2">
              <Rate
                disabled
                allowHalf
                value={stats.averageRating}
                style={{ fontSize: 18 }}
                className="text-base sm:text-lg md:text-2xl"
              />
            </div>
            <p className="text-sm sm:text-base text-gray-600">{stats.totalReviews} đánh giá</p>
          </div>

          {/* Rating Breakdown */}
          <div className="md:col-span-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div
                key={rating}
                className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 cursor-pointer hover:bg-gray-100 p-1.5 sm:p-2 rounded transition"
                onClick={() => {
                  setSelectedRating(selectedRating === rating ? null : rating);
                  setPage(1);
                }}
              >
                <span className="text-xs sm:text-sm w-6 sm:w-8">
                  {rating} <StarFilled style={{ color: "#fadb14" }} />
                </span>
                <Progress
                  percent={getRatingPercentage(rating)}
                  strokeColor="#fadb14"
                  className="flex-1"
                  showInfo={false}
                />
                <span className="text-xs sm:text-sm w-10 sm:w-12 text-right text-gray-600">
                  {getRatingPercentage(rating)}%
                </span>
                <span className="text-xs sm:text-sm w-12 sm:w-16 text-right text-gray-500">
                  ({stats.ratingBreakdown[rating]})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Stats */}
      {stats && (
        <Space size="small" wrap className="mb-4 sm:mb-6 md:mb-8">
          <Tag icon={<PictureOutlined />} color="blue" className="text-xs sm:text-sm">
            {stats.withImagesPercentage}% có ảnh ({stats.withImagesCount})
          </Tag>
          <Tag icon={<VideoCameraOutlined />} color="purple" className="text-xs sm:text-sm">
            {stats.withVideosPercentage}% có video ({stats.withVideosCount})
          </Tag>
        </Space>
      )}

      {/* Write Review Button */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        {canReview ? (
          <Button
            type="primary"
            size="large"
            onClick={() => setShowCreateModal(true)}
          >
            Viết đánh giá
          </Button>
        ) : (
          <Tag color="default" icon={<FilterOutlined />}>
            {eligibilityMessage}
          </Tag>
        )}
      </div>

      {/* Filters */}
      <Space size="small" wrap className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b">
        {/* Sort */}
        <Select
          value={selectedSort}
          onChange={(value) => {
            setSelectedSort(value);
            setPage(1);
          }}
          style={{ width: '100%', minWidth: 150, maxWidth: 200 }}
          className="w-full sm:w-auto"
          options={[
            { value: "newest", label: "Mới nhất" },
            { value: "rating_high", label: "Đánh giá cao nhất" },
            { value: "rating_low", label: "Đánh giá thấp nhất" },
          ]}
        />

        {/* Filter */}
        <Select
          value={selectedFilter}
          onChange={(value) => {
            setSelectedFilter(value);
            setPage(1);
          }}
          style={{ width: '100%', minWidth: 140, maxWidth: 180 }}
          className="w-full sm:w-auto"
          options={[
            { value: "all", label: "Tất cả" },
            { value: "with_images", label: "Có ảnh" },
            { value: "with_videos", label: "Có video" },
            { value: "with_media", label: "Có ảnh/video" },
          ]}
        />

        {selectedRating && (
          <Tag
            closable
            onClose={() => {
              setSelectedRating(null);
              setPage(1);
            }}
            color="gold"
          >
            {selectedRating} <StarFilled />
          </Tag>
        )}
      </Space>

      {/* Reviews List */}
      <div>
        {reviews.length === 0 ? (
          <Empty description="Chưa có đánh giá nào" />
        ) : (
          <>
            {reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                onEdit={(updatedReview) => {
                  setReviews((prev) =>
                    prev.map((r) =>
                      r.id === updatedReview.id ? updatedReview : r
                    )
                  );
                  fetchData(); // Refresh stats to update images/videos count
                }}
                onDelete={(reviewId) => {
                  setReviews((prev) => prev.filter((r) => r.id !== reviewId));
                  fetchData(); // Refresh stats
                  checkEligibility(); // Re-check to show write button
                }}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-6 sm:mt-8">
                <Button
                  onClick={() => setPage((prev) => prev + 1)}
                  loading={loading}
                  size="large"
                  className="w-full sm:w-auto"
                >
                  Xem thêm đánh giá
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Review Modal */}
      <CreateReviewModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          if (onModalClose) {
            onModalClose();
          }
        }}
        productId={productId}
        onReviewCreated={handleReviewCreated}
      />
    </div>
  );
};

export default Reviews;

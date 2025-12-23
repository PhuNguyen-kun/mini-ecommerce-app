import { Rate, Avatar, Tag, Button, Tooltip, Image, Popconfirm, Space, message } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import EditReviewModal from './EditReviewModal';
import reviewService from '../../services/reviewService';

const ReviewItem = ({ review, onEdit, onDelete }) => {
  const [showAllImages, setShowAllImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Parse images if it's a string
  const images = typeof review.images === 'string' ? JSON.parse(review.images) : (review.images || []);

  // Check if current user owns this review
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
  const isOwner = currentUserId && review.user?.id === currentUserId;

  const renderStars = (rating) => {
    return <Rate disabled value={rating} style={{ fontSize: 16 }} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Use floor instead of ceil

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await reviewService.deleteReview(review.id);
      if (response.success) {
        message.success('Xóa đánh giá thành công!');
        onDelete(review.id);
      }
    } catch (error) {
      message.error('Không thể xóa đánh giá. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditComplete = (updatedReview) => {
    setShowEditModal(false);
    onEdit(updatedReview);
  };

  const displayImages = showAllImages ? images : (images.slice(0, 4) || []);

  return (
    <div className="border-b border-gray-200 pb-6 mb-6">
      {/* User Info */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar 
          size={40}
          src={review.user?.avatar_url}
        >
          {review.user?.full_name?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 justify-between">
            <Space>
              <span className="font-medium">{review.user?.full_name || 'Anonymous'}</span>
              <Tag icon={<CheckCircleOutlined />} color="success">
                Đã mua hàng
              </Tag>
            </Space>
            
            {/* Edit/Delete buttons */}
            {isOwner && (
              <Space>
                <Tooltip title="Chỉnh sửa">
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => setShowEditModal(true)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Xóa đánh giá"
                  description="Bạn có chắc chắn muốn xóa đánh giá này?"
                  onConfirm={handleDelete}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true, loading: isDeleting }}
                >
                  <Tooltip title="Xóa">
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      loading={isDeleting}
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {renderStars(review.rating)}
            <span className="text-sm text-gray-500">
              • {formatDate(review.updatedAt || review.updated_at || review.createdAt || review.created_at)}
              {(review.updatedAt || review.updated_at) && 
               new Date(review.updatedAt || review.updated_at).getTime() !== new Date(review.createdAt || review.created_at).getTime() && (
                <span className="text-gray-400"> (đã chỉnh sửa)</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Comment */}
      <p className="text-gray-700 mb-3 leading-relaxed">
        {review.comment}
      </p>

      {/* Images */}
      {images && images.length > 0 && (
        <div className="mb-3">
          <Image.PreviewGroup>
            <div className="grid grid-cols-4 gap-2">
              {displayImages.map((img, idx) => (
                <Image
                  key={idx}
                  src={img.url}
                  alt={`Review ${idx + 1}`}
                  className="rounded-lg"
                  style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                />
              ))}
            </div>
          </Image.PreviewGroup>
          {images.length > 4 && !showAllImages && (
            <Button 
              type="link" 
              onClick={() => setShowAllImages(true)}
              className="mt-2 p-0"
            >
              Xem thêm {images.length - 4} ảnh
            </Button>
          )}
        </div>
      )}

      {/* Video */}
      {review.video_url && (
        <div className="mb-3">
          <video
            src={review.video_url}
            controls
            className="w-full max-w-md rounded-lg border"
          />
        </div>
      )}

      {/* Edit Review Modal */}
      <EditReviewModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        review={review}
        onReviewUpdated={handleEditComplete}
      />
    </div>
  );
};

export default ReviewItem;

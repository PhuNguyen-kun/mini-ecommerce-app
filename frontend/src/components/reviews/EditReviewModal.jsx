import { useState, useEffect } from 'react';
import { Modal, Rate, Input, Upload, message, Image } from 'antd';
 import { PictureOutlined, DeleteOutlined, VideoCameraOutlined } from '@ant-design/icons';
import reviewService from '../../services/reviewService';

const { TextArea } = Input;

const EditReviewModal = ({ isOpen, onClose, review, onReviewUpdated }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newVideo, setNewVideo] = useState([]);
  const [existingVideo, setExistingVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
      // Parse images if it's a string
      const images = typeof review.images === 'string' 
        ? JSON.parse(review.images) 
        : (review.images || []);
      setExistingImages(images);
      setNewImages([]);
      // Set existing video
      setExistingVideo(review.video_url || null);
      setNewVideo([]);
    }
  }, [review]);

  const handleNewImageChange = ({ fileList }) => {
    const totalImages = existingImages.length + fileList.length;
    if (totalImages > 5) {
      message.error('Tối đa 5 ảnh');
      return;
    }
    setNewImages(fileList);
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleVideoChange = ({ fileList }) => {
    if (fileList.length > 1) {
      message.error('Tối đa 1 video');
      return;
    }
    setNewVideo(fileList);
  };

  const removeExistingVideo = () => {
    setExistingVideo(null);
  };

  const handleSubmit = async () => {
    if (comment.length < 10) {
      message.error('Nhận xét phải có ít nhất 10 ký tự');
      return;
    }
    
    if (comment.length > 2000) {
      message.error('Nhận xét không được quá 2000 ký tự');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('comment', comment);
      
      // Keep existing images
      formData.append('existingImages', JSON.stringify(existingImages));
      
      // Add new images
      newImages.forEach((image) => {
        formData.append('images', image.originFileObj);
      });

      // Handle video
      if (newVideo.length > 0) {
        formData.append('videos', newVideo[0].originFileObj);
      } else if (!existingVideo) {
        // If removed existing video and no new video
        formData.append('removeVideo', 'true');
      }

      const response = await reviewService.updateReview(review.id, formData);
      
      if (response.success) {
        message.success('Cập nhật đánh giá thành công!');
        onReviewUpdated(response.data);
        onClose();
      }
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa đánh giá"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText="Cập nhật"
      cancelText="Hủy"
      width={700}
    >
      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Đánh giá của bạn <span className="text-red-500">*</span>
        </label>
        <Rate value={rating} onChange={setRating} style={{ fontSize: 32 }} />
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Nhận xét của bạn <span className="text-red-500">*</span>
        </label>
        <TextArea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
          rows={5}
          showCount
          maxLength={2000}
          required
        />
      </div>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Ảnh hiện tại</label>
          <div className="grid grid-cols-4 gap-2">
            {existingImages.map((img, index) => (
              <div key={index} className="relative group">
                <Image
                  src={img.url}
                  alt={`Existing ${index + 1}`}
                  style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                  className="rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                >
                  <DeleteOutlined />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Thêm ảnh mới (Tối đa {5 - existingImages.length} ảnh)
        </label>
        <Upload
          listType="picture-card"
          fileList={newImages}
          onChange={handleNewImageChange}
          beforeUpload={() => false}
          maxCount={5 - existingImages.length}
          accept="image/*"
          multiple
        >
          {(existingImages.length + newImages.length) < 5 && (
            <div>
              <PictureOutlined />
              <div style={{ marginTop: 8 }}>Chọn ảnh</div>
            </div>
          )}
        </Upload>
      </div>

      {/* Existing Video */}
      {existingVideo && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Video hiện tại</label>
          <div className="relative inline-block">
            <video
              src={existingVideo}
              controls
              className="w-64 h-40 rounded-lg border"
            />
            <button
              type="button"
              onClick={removeExistingVideo}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <DeleteOutlined />
            </button>
          </div>
        </div>
      )}

      {/* New Video */}
      {!existingVideo && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Video (Tối đa 1)</label>
          <Upload
            listType="picture-card"
            fileList={newVideo}
            onChange={handleVideoChange}
            beforeUpload={() => false}
            maxCount={1}
            accept="video/*"
          >
            {newVideo.length < 1 && (
              <div>
                <VideoCameraOutlined />
                <div style={{ marginTop: 8 }}>Chọn video</div>
              </div>
            )}
          </Upload>
        </div>
      )}
    </Modal>
  );
};

export default EditReviewModal;

import { useState } from 'react';
import { Modal, Rate, Input, Upload, message } from 'antd';
import { PictureOutlined, VideoCameraOutlined } from '@ant-design/icons';
import reviewService from '../../services/reviewService';

const { TextArea } = Input;

const CreateReviewModal = ({ isOpen, onClose, productId, onReviewCreated }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = ({ fileList }) => {
    if (fileList.length > 5) {
      message.error('Tối đa 5 ảnh');
      return;
    }
    setImages(fileList);
  };

  const handleVideoChange = ({ fileList }) => {
    if (fileList.length > 1) {
      message.error('Tối đa 1 video');
      return;
    }
    setVideos(fileList);
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
      formData.append('productId', productId);
      formData.append('rating', rating);
      formData.append('comment', comment);
      
      images.forEach((image) => {
        formData.append('images', image.originFileObj);
      });
      
      videos.forEach((video) => {
        formData.append('videos', video.originFileObj);
      });

      const response = await reviewService.createReview(formData);
      
      if (response.success) {
        message.success('Đánh giá thành công!');
        onReviewCreated();
        onClose();
        // Reset form
        setRating(5);
        setComment('');
        setImages([]);
        setVideos([]);
      }
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Viết đánh giá"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText="Gửi đánh giá"
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

      {/* Images */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Hình ảnh (Tối đa 5 ảnh)
        </label>
        <Upload
          listType="picture-card"
          fileList={images}
          onChange={handleImageChange}
          beforeUpload={() => false}
          maxCount={5}
          accept="image/*"
          multiple
        >
          {images.length < 5 && (
            <div>
              <PictureOutlined />
              <div style={{ marginTop: 8 }}>Chọn ảnh</div>
            </div>
          )}
        </Upload>
      </div>

      {/* Videos */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Video (Tối đa 1 video)
        </label>
        <Upload
          listType="picture-card"
          fileList={videos}
          onChange={handleVideoChange}
          beforeUpload={() => false}
          maxCount={1}
          accept="video/*"
        >
          {videos.length < 1 && (
            <div>
              <VideoCameraOutlined />
              <div style={{ marginTop: 8 }}>Chọn video</div>
            </div>
          )}
        </Upload>
      </div>
    </Modal>
  );
};

export default CreateReviewModal;

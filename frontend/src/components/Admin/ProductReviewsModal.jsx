import { Modal, Image } from 'antd';
import { FiStar, FiUser, FiVideo } from 'react-icons/fi';

const ProductReviewsModal = ({
    visible,
    onClose,
    product,
    reviews,
    loading
}) => {
    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    {product?.images?.[0]?.image_url && (
                        <img
                            src={product.images[0].image_url}
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover border"
                        />
                    )}
                    <div>
                        <h3 className="font-semibold text-lg">Tất cả đánh giá sản phẩm</h3>
                        <p className="text-sm text-gray-600">{product?.name}</p>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={900}
            centered
            destroyOnClose
        >
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    Chưa có đánh giá nào cho sản phẩm này
                </div>
            ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    <div className="mb-4 text-sm text-gray-600">
                        Tổng số: <span className="font-semibold">{reviews.length}</span> đánh giá
                    </div>
                    {reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            {/* User Info */}
                            <div className="flex items-start gap-3 mb-3">
                                <img
                                    src={review.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.full_name || "User")}&background=random`}
                                    alt={review.user?.full_name || 'User'}
                                    className="w-10 h-10 rounded-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.full_name || "User")}&background=random`;
                                    }}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{review.user?.full_name || 'N/A'}</span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FiStar
                                                key={star}
                                                className={`w-4 h-4 ${star <= review.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Comment */}
                            {review.comment && (
                                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.comment}</p>
                            )}

                            {/* Images */}
                            {review.images && review.images.length > 0 && (
                                <Image.PreviewGroup>
                                    <div className="flex gap-2 mb-2">
                                        {review.images.slice(0, 4).map((img, idx) => (
                                            <Image
                                                key={idx}
                                                src={img.image_url || img.url}
                                                alt={`Review ${idx + 1}`}
                                                className="w-20 h-20 object-cover rounded border"
                                            />
                                        ))}
                                        {review.images.length > 4 && (
                                            <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center text-sm text-gray-600">
                                                +{review.images.length - 4}
                                            </div>
                                        )}
                                    </div>
                                </Image.PreviewGroup>
                            )}

                            {/* Video Badge */}
                            {review.video_url && (
                                <div className="flex items-center gap-1 text-sm text-blue-600">
                                    <FiVideo className="w-4 h-4" />
                                    <span>Có video đính kèm</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
};

export default ProductReviewsModal;

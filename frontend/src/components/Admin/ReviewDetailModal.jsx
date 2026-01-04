import { Modal, Spin, Image } from 'antd';
import {
    FiStar,
    FiTrash2,
    FiImage,
    FiVideo,
    FiCalendar,
    FiUser,
    FiPackage,
    FiList
} from 'react-icons/fi';

const ReviewDetailModal = ({ review, visible, onClose, onDelete, loading, onViewProductReviews }) => {
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
        <Modal
            title="Chi tiết đánh giá"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            centered
            destroyOnClose
        >
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Spin size="large" tip="Đang tải chi tiết..." />
                </div>
            ) : !review ? (
                <div className="text-center py-12 text-gray-500">
                    Không có dữ liệu
                </div>
            ) : (
                <div className="space-y-4">
                    {/* User Info */}
                    <div className="border-b pb-4">
                        <h4 className="font-semibold mb-2">Thông tin người dùng</h4>
                        <div className="flex items-center gap-3">
                            <img
                                src={review.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.full_name || "User")}&background=random`}
                                alt={review.user?.full_name || 'User'}
                                className="w-12 h-12 rounded-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.full_name || "User")}&background=random`;
                                }}
                            />
                            <div>
                                <p className="font-medium">{review.user?.full_name || 'N/A'}</p>
                                <p className="text-sm text-gray-600">{review.user?.email || 'N/A'}</p>
                                {review.user?.phone && (
                                    <p className="text-sm text-gray-600">📞 {review.user.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="border-b pb-4">
                        <h4 className="font-semibold mb-2">Sản phẩm</h4>
                        <div className="flex items-center gap-3">
                            {(() => {
                                // Lấy variant từ order items
                                let colorOptionValueId = null;
                                const orderItem = review.order?.items?.find(
                                    item => item.variant?.product_id === review.product?.id
                                );
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
                                    <Image
                                        src={productImage}
                                        alt={review.product?.name}
                                        width={64}
                                        height={64}
                                        className="rounded object-cover border"
                                        preview={true}
                                        fallback="/placeholder.png"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center border">
                                        <FiPackage className="w-8 h-8 text-gray-500" />
                                    </div>
                                );
                            })()}
                            <div>
                                <p className="font-medium">{review.product?.name || 'N/A'}</p>
                                <p className="text-sm text-gray-600">ID: {review.product?.id}</p>
                                {review.order?.items?.length > 0 && (() => {
                                    const orderItem = review.order.items.find(
                                        item => item.variant?.product_id === review.product?.id
                                    );
                                    if (orderItem?.variant?.option_values) {
                                        const variantDesc = orderItem.variant.option_values
                                            .map(ov => ov.value)
                                            .join(' - ');
                                        return (
                                            <p className="text-sm text-gray-600">
                                                Phân loại: {variantDesc}
                                            </p>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Review Info */}
                    <div className="border-b pb-4">
                        <h4 className="font-semibold mb-2">Nội dung đánh giá</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Rating:</span>
                                {renderStars(review.rating)}
                                <span className="font-medium">{review.rating}/5</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Bình luận:</span>
                                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{review.comment}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiCalendar className="w-4 h-4" />
                                <span>Ngày tạo: {formatDate(review.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                        <div className="border-b pb-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <FiImage className="w-4 h-4" />
                                Hình ảnh ({review.images.length})
                            </h4>
                            <Image.PreviewGroup>
                                <div className="grid grid-cols-3 gap-2">
                                    {review.images.map((img, idx) => (
                                        <Image
                                            key={idx}
                                            src={img.image_url || img.url}
                                            alt={`Review ${idx + 1}`}
                                            className="w-full h-32 object-cover rounded border"
                                        />
                                    ))}
                                </div>
                            </Image.PreviewGroup>
                        </div>
                    )}

                    {/* Video */}
                    {review.video_url && (
                        <div className="border-b pb-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <FiVideo className="w-4 h-4" />
                                Video
                            </h4>
                            <video
                                src={review.video_url}
                                controls
                                className="w-full rounded border"
                            />
                        </div>
                    )}

                    {/* Order Info */}
                    {review.order && (
                        <div className="border-b pb-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <FiPackage className="w-4 h-4" />
                                Thông tin đơn hàng
                            </h4>
                            <p className="text-sm text-gray-600">
                                Mã đơn: <span className="font-medium">{review.order.order_code}</span>
                            </p>
                            {review.order.status && (
                                <p className="text-sm text-gray-600">
                                    Trạng thái: <span className="font-medium">{review.order.status}</span>
                                </p>
                            )}
                            {review.order.created_at && (
                                <p className="text-sm text-gray-600">
                                    Ngày đặt: {formatDate(review.order.created_at)}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <button
                            onClick={() => {
                                onViewProductReviews(review.product?.id);
                            }}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                            <FiList className="w-4 h-4" />
                            Xem tất cả đánh giá sản phẩm
                        </button>
                        <button
                            onClick={() => {
                                onDelete(review);
                                onClose();
                            }}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                        >
                            <FiTrash2 className="w-4 h-4" />
                            Xóa đánh giá
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ReviewDetailModal;

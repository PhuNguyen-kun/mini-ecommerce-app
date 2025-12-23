const ORDER_STATUS = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAID: 'PAID',
    SHIPPING: 'SHIPPING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    PAYMENT_FAILED: 'PAYMENT_FAILED'
};

// Chỉ những trạng thái này mới được review
const REVIEWABLE_ORDER_STATUS = [ORDER_STATUS.COMPLETED];

const REVIEW_CONSTANTS = {
    MIN_RATING: 1,
    MAX_RATING: 5,
    MIN_COMMENT_LENGTH: 10,
    MAX_COMMENT_LENGTH: 2000,
    MAX_IMAGES: 5,
    MAX_VIDEOS: 1,
    IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
    VIDEO_MAX_SIZE: 50 * 1024 * 1024, // 50MB
    VIDEO_MAX_DURATION: 30, // seconds
};

const REVIEW_SORT = {
    NEWEST: 'newest',
    HELPFUL: 'helpful',
    RATING_HIGH: 'rating_high',
    RATING_LOW: 'rating_low',
};

const REVIEW_FILTER = {
    ALL: 'all',
    WITH_IMAGES: 'with_images',
    WITH_VIDEOS: 'with_videos',
    WITH_MEDIA: 'with_media',
    RATING_5: '5',
    RATING_4: '4',
    RATING_3: '3',
    RATING_2: '2',
    RATING_1: '1',
};

module.exports = {
    ORDER_STATUS,
    REVIEWABLE_ORDER_STATUS,
    REVIEW_CONSTANTS,
    REVIEW_SORT,
    REVIEW_FILTER,
};

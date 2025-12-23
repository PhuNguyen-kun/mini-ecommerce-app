const db = require("../models");
const { NotFoundError, ForbiddenError, BadRequestError } = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");
const { REVIEWABLE_ORDER_STATUS, REVIEW_SORT, REVIEW_FILTER } = require("../constants/orderConstants");
const { Op } = require("sequelize");

class ReviewService {
    /**
     * Kiểm tra user có thể review product này không (verified purchase)
     * @param {number} userId
     * @param {number} productId
     * @returns {Promise<{canReview: boolean, orderItemId?: number, message?: string}>}
     */
    async checkReviewEligibility(userId, productId) {
        // Tìm order_item của user cho product này
        const orderItem = await db.OrderItem.findOne({
            include: [
                {
                    model: db.Order,
                    as: "order",
                    where: {
                        user_id: userId,
                        status: { [Op.in]: REVIEWABLE_ORDER_STATUS },
                    },
                    required: true,
                },
                {
                    model: db.ProductVariant,
                    as: "variant",
                    where: { product_id: productId },
                    required: true,
                },
            ],
        });

        if (!orderItem) {
            return {
                canReview: false,
                message: "Bạn chưa mua sản phẩm này hoặc đơn hàng chưa hoàn thành",
            };
        }

        // Kiểm tra xem đã review chưa
        const existingReview = await db.ProductReview.findOne({
            where: {
                user_id: userId,
                product_id: productId,
                order_id: orderItem.order_id,
            },
        });

        if (existingReview) {
            return {
                canReview: false,
                message: "Bạn đã review sản phẩm này rồi",
                reviewId: existingReview.id,
            };
        }

        return {
            canReview: true,
            orderItemId: orderItem.id,
            orderId: orderItem.order_id,
        };
    }

    /**
     * Tạo review mới
     * @param {number} userId
     * @param {object} reviewData - { productId, rating, comment, images, videos }
     * @returns {Promise<object>}
     */
    async createReview(userId, reviewData) {
        const { productId, rating, comment, images = [], videos = [] } = reviewData;

        // Kiểm tra eligibility
        const eligibility = await this.checkReviewEligibility(userId, productId);
        if (!eligibility.canReview) {
            throw new ForbiddenError(eligibility.message);
        }

        // Kiểm tra product tồn tại
        const product = await db.Product.findByPk(productId);
        if (!product) {
            throw new NotFoundError("Sản phẩm không tồn tại");
        }

        // Tạo review
        const review = await db.ProductReview.create({
            user_id: userId,
            product_id: productId,
            order_id: eligibility.orderId,
            rating,
            comment,
            images: images.length > 0 ? images : null,
            video_url: videos.length > 0 ? videos[0].url : null,
            video_public_id: videos.length > 0 ? videos[0].public_id : null,
            is_approved: true,
        });

        // Load lại với relations
        const createdReview = await db.ProductReview.findByPk(review.id, {
            include: [
                {
                    model: db.User,
                    as: "user",
                    attributes: ["id", "full_name", "email", "avatar_url"],
                },
                {
                    model: db.Product,
                    as: "product",
                    attributes: ["id", "name", "slug"],
                },
            ],
        });

        const createdReviewData = createdReview.toJSON();
        // Ensure images is parsed as array
        if (createdReviewData.images && typeof createdReviewData.images === 'string') {
            createdReviewData.images = JSON.parse(createdReviewData.images);
        }

        return createdReviewData;
    }

    /**
     * Lấy danh sách reviews của product với filter, sort, pagination
     * @param {number} productId
     * @param {object} options - { page, limit, sort, filter, rating }
     * @returns {Promise<object>}
     */
    async getProductReviews(productId, options = {}) {
        const {
            page = 1,
            limit = 10,
            sort = REVIEW_SORT.NEWEST,
            filter = REVIEW_FILTER.ALL,
            rating = null,
        } = options;

        const offset = (page - 1) * limit;

        // Build where clause
        const where = {
            product_id: productId,
            is_approved: true,
        };

        // Filter by rating
        if (rating) {
            where.rating = parseInt(rating);
        }

        // Filter by media
        if (filter === REVIEW_FILTER.WITH_IMAGES) {
            where.images = { [Op.ne]: null };
        } else if (filter === REVIEW_FILTER.WITH_VIDEOS) {
            // Cần join với ProductVideo
        }

        // Build order clause
        let order = [];
        switch (sort) {
            case REVIEW_SORT.NEWEST:
                order = [["created_at", "DESC"]];
                break;
            case REVIEW_SORT.RATING_HIGH:
                order = [["rating", "DESC"], ["created_at", "DESC"]];
                break;
            case REVIEW_SORT.RATING_LOW:
                order = [["rating", "ASC"], ["created_at", "DESC"]];
                break;
            default:
                order = [["created_at", "DESC"]];
        }

        // Get reviews
        const { count, rows: reviews } = await db.ProductReview.findAndCountAll({
            where,
            attributes: ["id", "user_id", "product_id", "order_id", "rating", "comment", "images", "video_url", "video_public_id", "is_approved", "created_at", "updated_at"],
            include: [
                {
                    model: db.User,
                    as: "user",
                    attributes: ["id", "full_name", "avatar_url"],
                },
                {
                    model: db.Order,
                    as: "order",
                    attributes: ["id", "created_at"],
                },
            ],
            order,
            limit: parseInt(limit),
            offset,
        });

        // Parse images for each review
        const reviewsData = reviews.map(r => {
            const reviewJson = r.toJSON();
            if (reviewJson.images && typeof reviewJson.images === 'string') {
                reviewJson.images = JSON.parse(reviewJson.images);
            }
            return reviewJson;
        });

        return {
            reviews: reviewsData,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalItems: count,
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    /**
     * Lấy thống kê review của product
     * @param {number} productId
     * @returns {Promise<object>}
     */
    async getProductReviewStats(productId) {
        const reviews = await db.ProductReview.findAll({
            where: { product_id: productId, is_approved: true },
            attributes: ["id", "rating", "images", "video_url"],
        });

        const totalReviews = reviews.length;
        
        if (totalReviews === 0) {
            return {
                totalReviews: 0,
                averageRating: 0,
                ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                withImagesCount: 0,
                withImagesPercentage: 0,
                withVideosCount: 0,
                withVideosPercentage: 0,
            };
        }

        // Calculate average rating
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = (totalRating / totalReviews).toFixed(1);

        // Rating breakdown
        const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            ratingBreakdown[r.rating]++;
        });

        // Count reviews with images
        const withImagesCount = reviews.filter(r => r.images && r.images.length > 0).length;
        const withImagesPercentage = ((withImagesCount / totalReviews) * 100).toFixed(1);

        // Count reviews with videos (from video_url field)
        const withVideosCount = reviews.filter(r => r.video_url).length;
        const withVideosPercentage = ((withVideosCount / totalReviews) * 100).toFixed(1);

        return {
            totalReviews,
            averageRating: parseFloat(averageRating),
            ratingBreakdown,
            withImagesCount,
            withImagesPercentage: parseFloat(withImagesPercentage),
            withVideosCount,
            withVideosPercentage: parseFloat(withVideosPercentage),
        };
    }

    /**
     * Cập nhật review
     * @param {number} userId
     * @param {number} reviewId
     * @param {object} updateData
     * @returns {Promise<object>}
     */
    async updateReview(userId, reviewId, updateData) {
        const review = await db.ProductReview.findByPk(reviewId);

        if (!review) {
            throw new NotFoundError("Review không tồn tại");
        }

        if (review.user_id !== userId) {
            throw new ForbiddenError("Bạn không có quyền cập nhật review này");
        }

        const { rating, comment, images, videos = [], removeVideo = false } = updateData;

        const newVideoUrl = removeVideo ? null : (videos.length > 0 ? videos[0].url : review.video_url);
        const newVideoPublicId = removeVideo ? null : (videos.length > 0 ? videos[0].public_id : review.video_public_id);

        await review.update({
            rating: rating ?? review.rating,
            comment: comment ?? review.comment,
            images: images ?? review.images,
            video_url: newVideoUrl,
            video_public_id: newVideoPublicId,
            updatedAt: new Date(), // Cập nhật thời gian chỉnh sửa
        });

        // Recalculate product stats
        const stats = await this.getProductReviewStats(review.product_id);
        await db.Product.update(
            {
                average_rating: stats.averageRating,
                total_reviews: stats.totalReviews,
            },
            { where: { id: review.product_id } }
        );

        // Reload with user info
        const updatedReview = await db.ProductReview.findByPk(reviewId, {
            include: [
                {
                    model: db.User,
                    as: "user",
                    attributes: ["id", "full_name", "avatar_url"],
                },
            ],
        });

        const reviewData = updatedReview.toJSON();
        // Ensure images is parsed as array
        if (reviewData.images && typeof reviewData.images === 'string') {
            reviewData.images = JSON.parse(reviewData.images);
        }

        return reviewData;
    }

    /**
     * Xóa review (soft delete)
     * @param {number} userId
     * @param {number} reviewId
     * @returns {Promise<void>}
     */
    async deleteReview(userId, reviewId) {
        const review = await db.ProductReview.findByPk(reviewId);

        if (!review) {
            throw new NotFoundError("Review không tồn tại");
        }

        if (review.user_id !== userId) {
            throw new ForbiddenError("Bạn không có quyền xóa review này");
        }

        await review.destroy();
    }

    /**
     * Lấy reviews của user
     * @param {number} userId
     * @param {object} options - { page, limit }
     * @returns {Promise<object>}
     */
    async getUserReviews(userId, options = {}) {
        const { page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        const { count, rows: reviews } = await db.ProductReview.findAndCountAll({
            where: { user_id: userId },
            include: [
                {
                    model: db.Product,
                    as: "product",
                    attributes: ["id", "name", "slug"],
                    include: [
                        {
                            model: db.ProductImage,
                            as: "images",
                            limit: 1,
                            attributes: ["url"],
                        },
                    ],
                },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset,
        });

        // Parse images for each review
        const reviewsData = reviews.map(r => {
            const reviewJson = r.toJSON();
            if (reviewJson.images && typeof reviewJson.images === 'string') {
                reviewJson.images = JSON.parse(reviewJson.images);
            }
            return reviewJson;
        });

        return {
            reviews: reviewsData,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalItems: count,
                totalPages: Math.ceil(count / limit),
            },
        };
    }
}

module.exports = new ReviewService();

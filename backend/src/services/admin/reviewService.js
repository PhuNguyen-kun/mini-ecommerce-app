const { Op } = require("sequelize");
const {
    Product, ProductReview, User, Order, ProductImage,
    OrderItem, ProductVariant, ProductOptionValue, ProductOption, // Import hết ở đây
    sequelize,
} = require("../../models");
const { ApiError } = require("../../utils/ApiError");

// Cấu hình Sort
const SORT_OPTIONS = {
    newest: [["created_at", "DESC"]],
    oldest: [["created_at", "ASC"]],
    rating_high: [["rating", "DESC"]],
    rating_low: [["rating", "ASC"]],
};

class ReviewService {
    // --- PUBLIC METHODS ---

    async getAllReviews({ page = 1, limit = 20, sort = "newest", ...filters }) {
        const parsedLimit = parseInt(limit) || 20;
        const offset = ((parseInt(page) || 1) - 1) * parsedLimit;

        // Xây dựng điều kiện lọc (Where clause)
        const where = this._buildFilterCondition(filters);

        // Xây dựng điều kiện include Product
        const productInclude = this._buildProductInclude(filters.categoryId);

        const { count, rows } = await ProductReview.findAndCountAll({
            where,
            include: [
                { model: User, as: "user", attributes: ["id", "full_name", "email", "avatar_url"] },
                productInclude,
                this._getOrderDeepInclude(), // Thêm include OrderItem → Variant → OptionValues để lấy thông tin variant đã mua
            ],
            order: SORT_OPTIONS[sort] || SORT_OPTIONS.newest,
            limit: parsedLimit,
            offset,
            distinct: true,
        });

        return {
            reviews: rows.map(r => this._parseReviewImages(r)),
            pagination: {
                currentPage: parseInt(page) || 1,
                totalPages: Math.ceil(count / parsedLimit),
                totalItems: count,
                itemsPerPage: parsedLimit,
            },
        };
    }

    async getReviewById(reviewId) {
        const review = await ProductReview.findByPk(reviewId, {
            include: [
                {
                    model: User, as: "user",
                    attributes: ["id", "full_name", "email", "phone", "avatar_url"]
                },
                {
                    model: Product, as: "product", attributes: ["id", "name", "slug"],
                    include: [{
                        model: ProductImage,
                        as: "images",
                        attributes: ["id", "image_url", "product_option_value_id", "is_primary"],
                        where: { deleted_at: null },
                        required: false
                    }]
                },
                this._getOrderDeepInclude() // Tách logic include sâu ra ngoài cho gọn
            ],
        });

        if (!review) throw new ApiError(404, "Review not found");

        return this._parseReviewImages(review);
    }

    async approveReview(reviewId) {
        return this._updateReviewStatus(reviewId, true);
    }

    async rejectReview(reviewId) {
        return this._updateReviewStatus(reviewId, false);
    }

    async deleteReview(reviewId) {
        const review = await this._findReviewOrThrow(reviewId);
        await review.destroy();
        await this.updateProductStats(review.product_id);
    }

    async getAdminStats() {
        const query = `
            SELECT
                COUNT(*) as total_reviews,
                COUNT(CASE WHEN is_approved = 1 THEN 1 END) as approved_reviews,
                COUNT(CASE WHEN is_approved = 0 THEN 1 END) as pending_reviews,
                AVG(rating) as average_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1,
                COUNT(CASE WHEN images IS NOT NULL AND images != '[]' THEN 1 END) as has_images,
                COUNT(CASE WHEN video_url IS NOT NULL THEN 1 END) as has_videos
            FROM product_reviews WHERE deleted_at IS NULL
        `;
        const [stats] = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

        // Helper parse số
        const parse = (val, isFloat = false) => (isFloat ? parseFloat(val) || 0 : parseInt(val) || 0);

        return {
            totalReviews: parse(stats.total_reviews),
            approvedReviews: parse(stats.approved_reviews),
            pendingReviews: parse(stats.pending_reviews),
            averageRating: parse(stats.average_rating, true),
            ratingBreakdown: {
                5: parse(stats.rating_5), 4: parse(stats.rating_4),
                3: parse(stats.rating_3), 2: parse(stats.rating_2), 1: parse(stats.rating_1),
            },
            reviewsWithImages: parse(stats.has_images),
            reviewsWithVideos: parse(stats.has_videos),
        };
    }

    async updateProductStats(productId) {
        const [stats] = await sequelize.query(
            `SELECT COUNT(*) as count, AVG(rating) as avg FROM product_reviews 
             WHERE product_id = :productId AND is_approved = 1 AND deleted_at IS NULL`,
            { replacements: { productId }, type: sequelize.QueryTypes.SELECT }
        );

        await Product.update(
            { review_count: stats.count || 0, average_rating: parseFloat(stats.avg) || 0 },
            { where: { id: productId } }
        );
    }

    // --- PRIVATE HELPER METHODS ---

    async _findReviewOrThrow(id) {
        const review = await ProductReview.findByPk(id);
        if (!review) throw new ApiError(404, "Review not found");
        return review;
    }

    async _updateReviewStatus(reviewId, isApproved) {
        const review = await this._findReviewOrThrow(reviewId);

        if (review.is_approved === isApproved) {
            throw new ApiError(400, `Review is already ${isApproved ? 'approved' : 'rejected'}`);
        }

        review.is_approved = isApproved;
        await review.save();
        await this.updateProductStats(review.product_id);
        return review;
    }

    _parseReviewImages(reviewInstance) {
        const data = reviewInstance.toJSON ? reviewInstance.toJSON() : reviewInstance;
        if (typeof data.images === "string") {
            try { data.images = JSON.parse(data.images); } catch { data.images = []; }
        }
        return data;
    }

    _buildFilterCondition({ search, is_approved, rating, productId, userId, startDate, endDate }) {
        const where = {};

        if (search) where.comment = { [Op.like]: `%${search}%` };
        if (rating) where.rating = parseInt(rating);
        if (productId) where.product_id = productId;
        if (userId) where.user_id = userId;

        if (is_approved !== null && is_approved !== undefined && is_approved !== "") {
            where.is_approved = String(is_approved) === "true";
        }

        if (startDate || endDate) {
            where.created_at = {};
            if (startDate) where.created_at[Op.gte] = new Date(startDate);
            if (endDate) where.created_at[Op.lte] = new Date(endDate);
        }
        return where;
    }

    _buildProductInclude(categoryId) {
        const include = {
            model: Product, as: "product", attributes: ["id", "name", "slug", "category_id"],
            include: [{
                model: ProductImage,
                as: "images",
                attributes: ["id", "image_url", "product_option_value_id", "is_primary"],
                where: { deleted_at: null },
                required: false
            }],
        };
        if (categoryId) {
            include.where = { category_id: categoryId };
            include.required = true;
        }
        return include;
    }

    _getOrderDeepInclude() {
        return {
            model: Order, as: "order", attributes: ["id", "order_code", "status", "created_at"],
            include: [{
                model: OrderItem, as: "items", attributes: ["id", "product_name_snapshot", "product_variant_id"],
                include: [{
                    model: ProductVariant, as: "variant", attributes: ["id", "sku", "product_id"],
                    include: [{
                        model: ProductOptionValue, as: "option_values", attributes: ["id", "value"], through: { attributes: [] },
                        include: [{ model: ProductOption, as: "option", attributes: ["id", "name"] }]
                    }]
                }]
            }]
        };
    }
}

module.exports = new ReviewService();
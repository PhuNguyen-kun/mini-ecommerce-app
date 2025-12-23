const reviewService = require("../services/reviewService");
const { responseOk, responseOkWithPagination } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

class ReviewController {
    /**
     * Kiểm tra user có thể review product không
     * GET /api/reviews/check-eligibility/:productId
     */
    checkEligibility = asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const result = await reviewService.checkReviewEligibility(req.user.id, parseInt(productId));
        return responseOk(res, result, "Check eligibility successfully");
    });

    /**
     * Tạo review mới
     * POST /api/reviews
     * Body: { productId, rating, comment, images[], videos[] }
     */
    createReview = asyncHandler(async (req, res) => {
        // images và videos đã được middleware upload lên Cloudinary
        // và parse vào req.body
        const result = await reviewService.createReview(req.user.id, req.body);
        return responseOk(res, result, "Review created successfully", 201);
    });

    /**
     * Lấy danh sách reviews của product
     * GET /api/reviews/product/:productId
     * Query: page, limit, sort, filter, rating
     */
    getProductReviews = asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const { page, limit, sort, filter, rating } = req.query;

        const result = await reviewService.getProductReviews(parseInt(productId), {
            page,
            limit,
            sort,
            filter,
            rating,
        });

        return responseOkWithPagination(
            res,
            result.reviews,
            result.pagination,
            "Get reviews successfully"
        );
    });

    /**
     * Lấy thống kê reviews của product
     * GET /api/reviews/product/:productId/stats
     */
    getProductReviewStats = asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const result = await reviewService.getProductReviewStats(parseInt(productId));
        return responseOk(res, result, "Get review stats successfully");
    });

    /**
     * Cập nhật review
     * PUT /api/reviews/:reviewId
     * Body: { rating, comment, images }
     */
    updateReview = asyncHandler(async (req, res) => {
        const { reviewId } = req.params;
        const result = await reviewService.updateReview(req.user.id, parseInt(reviewId), req.body);
        return responseOk(res, result, "Review updated successfully");
    });

    /**
     * Xóa review
     * DELETE /api/reviews/:reviewId
     */
    deleteReview = asyncHandler(async (req, res) => {
        const { reviewId } = req.params;
        await reviewService.deleteReview(req.user.id, parseInt(reviewId));
        return responseOk(res, null, "Review deleted successfully");
    });

    /**
     * Lấy reviews của user hiện tại
     * GET /api/reviews/my-reviews
     * Query: page, limit
     */
    getMyReviews = asyncHandler(async (req, res) => {
        const { page, limit } = req.query;
        const result = await reviewService.getUserReviews(req.user.id, { page, limit });
        return responseOkWithPagination(
            res,
            result.reviews,
            result.pagination,
            "Get my reviews successfully"
        );
    });
}

module.exports = new ReviewController();

const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const { authMiddleware } = require("../middlewares/auth");
const { uploadReviewFiles, handleUploadError } = require("../middlewares/upload");
const { parseReviewMediaFormData } = require("../middlewares/reviewFormData");
const {
    validateCreateReview,
    validateUpdateReview,
    validateGetReviews,
    validateReviewId,
    validateProductId,
} = require("../validators/reviewValidator");

// ======================
// PUBLIC ROUTES
// ======================

/**
 * Lấy danh sách reviews của product
 * GET /api/reviews/product/:productId
 * Query: page, limit, sort, filter, rating
 */
router.get("/product/:productId", validateGetReviews, reviewController.getProductReviews);

/**
 * Lấy thống kê reviews của product
 * GET /api/reviews/product/:productId/stats
 */
router.get("/product/:productId/stats", validateProductId, reviewController.getProductReviewStats);

// ======================
// AUTHENTICATED ROUTES
// ======================
router.use(authMiddleware);

/**
 * Kiểm tra user có thể review product không
 * GET /api/reviews/check-eligibility/:productId
 */
router.get("/check-eligibility/:productId", validateProductId, reviewController.checkEligibility);

/**
 * Tạo review mới
 * POST /api/reviews
 * Form-data:
 *   - productId (text)
 *   - rating (text)
 *   - comment (text)
 *   - images[] (files, max 5)
 *   - videos[] (files, max 1)
 */
router.post(
    "/",
    uploadReviewFiles,
    handleUploadError,
    parseReviewMediaFormData,
    validateCreateReview,
    reviewController.createReview
);

/**
 * Cập nhật review
 * PUT /api/reviews/:reviewId
 * Form-data:
 *   - rating (text)
 *   - comment (text)
 *   - existingImages (text - JSON string)
 *   - images[] (files - new images)
 *   - videos[] (files - new video)
 *   - removeVideo (text - 'true' to remove video)
 */
router.put(
    "/:reviewId",
    uploadReviewFiles,
    handleUploadError,
    parseReviewMediaFormData,
    validateUpdateReview,
    reviewController.updateReview
);

/**
 * Xóa review
 * DELETE /api/reviews/:reviewId
 */
router.delete("/:reviewId", validateReviewId, reviewController.deleteReview);

/**
 * Lấy reviews của user hiện tại
 * GET /api/reviews/my-reviews
 * Query: page, limit
 */
router.get("/my-reviews", reviewController.getMyReviews);

module.exports = router;

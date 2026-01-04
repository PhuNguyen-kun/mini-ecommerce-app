const express = require("express");
const router = express.Router();

const reviewController = require("../../controllers/admin/reviewController");
const { authMiddleware, requireAdmin } = require("../../middlewares/auth");
const {
    validateAdminGetReviews,
    validateAdminReviewId,
} = require("../../validators/reviewValidator");

// Tất cả routes dưới đây đều admin
router.use(authMiddleware, requireAdmin);

/**
 * Lấy thống kê reviews
 * GET /api/admin/reviews/stats
 */
router.get("/stats", reviewController.getAdminStats);

/**
 * Lấy tất cả reviews với filters
 * GET /api/admin/reviews
 * Query: page, limit, search, is_approved, rating, productId, userId, startDate, endDate, sort
 */
router.get("/", validateAdminGetReviews, reviewController.getAllReviews);

/**
 * Lấy chi tiết review by ID
 * GET /api/admin/reviews/:id
 */
router.get("/:id", validateAdminReviewId, reviewController.getReviewById);

/**
 * Approve review
 * PUT /api/admin/reviews/:id/approve
 */
router.put("/:id/approve", validateAdminReviewId, reviewController.approveReview);

/**
 * Reject review
 * PUT /api/admin/reviews/:id/reject
 */
router.put("/:id/reject", validateAdminReviewId, reviewController.rejectReview);

/**
 * Delete review (soft delete)
 * DELETE /api/admin/reviews/:id
 */
router.delete("/:id", validateAdminReviewId, reviewController.deleteReview);

module.exports = router;

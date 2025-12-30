const express = require("express");
const router = express.Router();

const reviewController = require("../../controllers/admin/reviewController");
const { authMiddleware, requireAdmin } = require("../../middlewares/auth");

// Tất cả routes dưới đây đều admin
router.use(authMiddleware, requireAdmin);

/**
 * Admin review routes
 * Các routes cho quản lý đánh giá
 */

// TODO: Thêm các routes quản lý đánh giá tại đây
// Ví dụ:
// router.get("/", reviewController.getAllReviews);
// router.get("/:id", reviewController.getReviewById);
// router.put("/:id/approve", reviewController.approveReview);
// router.delete("/:id", reviewController.deleteReview);

module.exports = router;

const reviewService = require("../../services/admin/reviewService");
const {
  responseOk,
  responseOkWithPagination,
} = require("../../utils/apiResponse");
const asyncHandler = require("../../middlewares/asyncHandler");

class ReviewController {
  /**
   * Lấy tất cả reviews với filters
   * GET /api/admin/reviews
   */
  getAllReviews = asyncHandler(async (req, res) => {
    const result = await reviewService.getAllReviews(req.query);
    return responseOkWithPagination(
      res,
      result.reviews,
      result.pagination,
      "Get all reviews successfully"
    );
  });

  /**
   * Lấy chi tiết review by ID
   * GET /api/admin/reviews/:id
   */
  getReviewById = asyncHandler(async (req, res) => {
    const review = await reviewService.getReviewById(req.params.id);
    return responseOk(res, review, "Get review detail successfully");
  });

  /**
   * Approve review
   * PUT /api/admin/reviews/:id/approve
   */
  approveReview = asyncHandler(async (req, res) => {
    const review = await reviewService.approveReview(req.params.id);
    return responseOk(res, review, "Review approved successfully");
  });

  /**
   * Reject review
   * PUT /api/admin/reviews/:id/reject
   */
  rejectReview = asyncHandler(async (req, res) => {
    const review = await reviewService.rejectReview(req.params.id);
    return responseOk(res, review, "Review rejected successfully");
  });

  /**
   * Delete review (soft delete)
   * DELETE /api/admin/reviews/:id
   */
  deleteReview = asyncHandler(async (req, res) => {
    await reviewService.deleteReview(req.params.id);
    return responseOk(res, null, "Review deleted successfully");
  });

  /**
   * Lấy thống kê reviews
   * GET /api/admin/reviews/stats
   */
  getAdminStats = asyncHandler(async (req, res) => {
    const stats = await reviewService.getAdminStats();
    return responseOk(res, stats, "Get review stats successfully");
  });
}

module.exports = new ReviewController();

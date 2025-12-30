const express = require("express");
const router = express.Router();

const dashboardController = require("../../controllers/admin/dashboardController");
const { authMiddleware, requireAdmin } = require("../../middlewares/auth");

// Tất cả routes dưới đây đều admin
router.use(authMiddleware, requireAdmin);

/**
 * GET /api/admin/dashboard/stats
 * Lấy thống kê dashboard
 */
router.get("/stats", dashboardController.getStats);

module.exports = router;

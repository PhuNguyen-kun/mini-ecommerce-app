const express = require("express");
const router = express.Router();

const { authMiddleware, requireAdmin } = require("../../middlewares/auth");

// Import các module routes
const adminProductRoutes = require("./productRoutes");
const adminDashboardRoutes = require("./dashboardRoutes");
const adminOrderRoutes = require("./orderRoutes");
const adminUserRoutes = require("./userRoutes");
const adminReviewRoutes = require("./reviewRoutes");

// Tất cả admin routes đều require admin
router.use(authMiddleware, requireAdmin);

// Mount routes modules
router.use("/products", adminProductRoutes);
router.use("/dashboard", adminDashboardRoutes);
router.use("/orders", adminOrderRoutes);
router.use("/users", adminUserRoutes);
router.use("/reviews", adminReviewRoutes);

module.exports = router;

const express = require("express");
const router = express.Router();

const { authMiddleware, requireAdmin } = require("../../middlewares/auth");

const dashboardController = require("../../controllers/admin/dashboardController");
const orderController = require("../../controllers/admin/orderController");
const userController = require("../../controllers/admin/userController");
const reviewController = require("../../controllers/admin/reviewController");

// mount product admin router
const adminProductRoutes = require("./productRoutes");

// tất cả admin routes đều require admin:
router.use(authMiddleware, requireAdmin);

// ---- Mount routes module ----
router.use("/products", adminProductRoutes);


module.exports = router;

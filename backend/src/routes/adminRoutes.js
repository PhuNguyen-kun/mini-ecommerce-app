const express = require("express");
const router = express.Router();
const { authMiddleware, requireAdmin } = require("../middlewares/auth");

const dashboardController = require("../controllers/admin/dashboardController");
const orderController = require("../controllers/admin/orderController");
const userController = require("../controllers/admin/userController");
const reviewController = require("../controllers/admin/reviewController");

router.use(authMiddleware, requireAdmin);

// Dashboard routes
router.get("/dashboard/stats", dashboardController.getStats);

module.exports = router;

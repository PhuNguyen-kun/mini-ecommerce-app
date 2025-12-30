const express = require("express");
const router = express.Router();

const orderController = require("../../controllers/admin/orderController");
const { authMiddleware, requireAdmin } = require("../../middlewares/auth");

// Tất cả routes dưới đây đều admin
router.use(authMiddleware, requireAdmin);

/**
 * Admin order routes
 * Các routes cho quản lý đơn hàng
 */

// TODO: Thêm các routes quản lý đơn hàng tại đây
// Ví dụ:
// router.get("/", orderController.getAllOrders);
// router.get("/:id", orderController.getOrderById);
// router.put("/:id/status", orderController.updateOrderStatus);
// router.delete("/:id", orderController.deleteOrder);

module.exports = router;

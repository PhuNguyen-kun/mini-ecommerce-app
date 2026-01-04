const express = require("express");
const router = express.Router();

const orderController = require("../../controllers/admin/orderController");
const { authMiddleware, requireAdmin } = require("../../middlewares/auth");

router.use(authMiddleware, requireAdmin);

router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id/status", orderController.updateOrderStatus);

module.exports = router;

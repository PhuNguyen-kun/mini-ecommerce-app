const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authMiddleware } = require("../middlewares/auth");
const { validateCheckout } = require("../validators/orderValidator");

router.use(authMiddleware);

router.post("/checkout", validateCheckout, orderController.checkout);
router.get("/", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id/cancel", orderController.cancelOrder);

module.exports = router;


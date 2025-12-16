const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authMiddleware } = require("../middlewares/auth");
const {
  validateAddToCart,
  validateUpdateCartItem,
} = require("../validators/cartValidator");

// Bắt buộc phải đăng nhập mới dùng được Cart
router.use(authMiddleware);

router.get("/", cartController.getCart);
router.post("/add", validateAddToCart, cartController.addToCart);
router.delete("/clear", cartController.clearCart);

// Item routes - must be after /clear to avoid conflict
router
  .route("/item/:id")
  .put(validateUpdateCartItem, cartController.updateCartItem)
  .delete(cartController.removeFromCart);

module.exports = router;

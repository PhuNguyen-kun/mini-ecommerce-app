const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { authMiddleware } = require("../middlewares/auth");
const { validateToggleWishlist } = require("../validators/wishlistValidator");
// Bắt buộc phải đăng nhập mới dùng được Wishlist
router.use(authMiddleware);

router.get("/", wishlistController.getMyWishlist);
router.post("/toggle", validateToggleWishlist, wishlistController.toggleWishlist);

module.exports = router;
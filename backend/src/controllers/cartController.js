const cartService = require("../services/cartService");
const { responseOk } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

class CartController {
  // Get cart
  getCart = asyncHandler(async (req, res) => {
    const result = await cartService.getCart(req.user.id);
    return responseOk(res, result, "Cart fetched successfully");
  });

  // Add item to cart
  addToCart = asyncHandler(async (req, res) => {
    const { product_variant_id, quantity } = req.body;
    const result = await cartService.addToCart(
      req.user.id,
      product_variant_id,
      quantity || 1
    );
    return responseOk(res, result, "Item added to cart successfully");
  });

  // Update cart item quantity
  updateCartItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const cartItemId = parseInt(id, 10);
    if (isNaN(cartItemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cart item ID" });
    }
    const result = await cartService.updateCartItem(
      req.user.id,
      cartItemId,
      quantity
    );
    return responseOk(res, result, "Cart item updated successfully");
  });

  // Remove item from cart
  removeFromCart = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cartItemId = parseInt(id, 10);
    if (isNaN(cartItemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cart item ID" });
    }
    const result = await cartService.removeFromCart(req.user.id, cartItemId);
    return responseOk(res, result, "Item removed from cart successfully");
  });

  // Clear cart
  clearCart = asyncHandler(async (req, res) => {
    const result = await cartService.clearCart(req.user.id);
    return responseOk(res, result, "Cart cleared successfully");
  });
}

module.exports = new CartController();

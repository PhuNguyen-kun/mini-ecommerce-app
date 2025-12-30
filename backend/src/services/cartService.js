const db = require("../models");
const { NotFoundError, BadRequestError } = require("../utils/ApiError");

class CartService {
  // Get or create cart for user
  async getOrCreateCart(userId) {
    let cart = await db.Cart.findOne({
      where: { user_id: userId },
    });

    if (!cart) {
      cart = await db.Cart.create({ user_id: userId });
    }

    return cart;
  }

  // Get cart with items
  async getCart(userId) {
    const cart = await this.getOrCreateCart(userId);

    const cartItems = await db.CartItem.findAll({
      where: { cart_id: cart.id },
      include: [
        {
          model: db.ProductVariant,
          as: "variant",
          include: [
            {
              model: db.Product,
              as: "product",
              include: [
                {
                  model: db.Category,
                  as: "category",
                  attributes: ["id", "name", "slug"],
                },
                {
                  model: db.ProductImage,
                  as: "images",
                  where: { deleted_at: null },
                  required: false,
                  attributes: ["id", "image_url", "product_option_value_id", "is_primary"],
                },
                {
                  model: db.ProductVariant,
                  as: "variants",
                  attributes: ["id", "price", "stock"],
                },
              ],
            },
            {
              model: db.ProductOptionValue,
              as: "option_values",
              through: { attributes: [] },
              include: [
                {
                  model: db.ProductOption,
                  as: "option",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    return {
      cart,
      items: cartItems,
    };
  }

  // Add item to cart
  async addToCart(userId, productVariantId, quantity = 1) {
    const variant = await db.ProductVariant.findByPk(productVariantId, {
      include: [
        {
          model: db.Product,
          as: "product",
        },
      ],
    });

    if (!variant) {
      throw new NotFoundError("Product variant not found");
    }

    if (!variant.is_active || variant.deleted_at) {
      throw new BadRequestError("Product variant is not available");
    }

    if (quantity < 1) {
      throw new BadRequestError("Quantity must be at least 1");
    }

    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists in cart
    let cartItem = await db.CartItem.findOne({
      where: {
        cart_id: cart.id,
        product_variant_id: productVariantId,
      },
    });

    if (cartItem) {
      // Update quantity
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = await db.CartItem.create({
        cart_id: cart.id,
        product_variant_id: productVariantId,
        quantity,
        unit_price: variant.price,
      });
    }

    return await this.getCart(userId);
  }

  // Update cart item quantity
  async updateCartItem(userId, cartItemId, quantity) {
    if (quantity < 1) {
      throw new BadRequestError("Quantity must be at least 1");
    }

    const cart = await this.getOrCreateCart(userId);
    const cartItem = await db.CartItem.findOne({
      where: {
        id: cartItemId,
        cart_id: cart.id,
      },
    });

    if (!cartItem) {
      throw new NotFoundError("Cart item not found");
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return await this.getCart(userId);
  }

  // Remove item from cart
  async removeFromCart(userId, cartItemId) {
    const cart = await this.getOrCreateCart(userId);
    const cartItem = await db.CartItem.findOne({
      where: {
        id: cartItemId,
        cart_id: cart.id,
      },
    });

    if (!cartItem) {
      throw new NotFoundError("Cart item not found");
    }

    await cartItem.destroy();

    return await this.getCart(userId);
  }

  // Clear cart
  async clearCart(userId) {
    const cart = await this.getOrCreateCart(userId);
    await db.CartItem.destroy({
      where: { cart_id: cart.id },
    });

    return await this.getCart(userId);
  }
}

module.exports = new CartService();


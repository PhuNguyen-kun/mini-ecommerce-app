const db = require("../models");
const cartService = require("./cartService");
const vnpayService = require("./vnpayService");
const { BadRequestError, NotFoundError } = require("../utils/ApiError");
const { Sequelize } = require("sequelize");

class OrderService {
  async generateOrderCode() {
    const year = new Date().getFullYear();
    const prefix = `ORD-${year}-`;

    const lastOrder = await db.Order.findOne({
      where: {
        order_code: {
          [Sequelize.Op.like]: `${prefix}%`,
        },
      },
      order: [["order_code", "DESC"]],
      attributes: ["order_code"],
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.order_code.split("-")[2]);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}${sequence.toString().padStart(3, "0")}`;
  }

  async getLocationNames(provinceId, districtId, wardId) {
    const [province, district, ward] = await Promise.all([
      db.Province.findByPk(provinceId, { attributes: ["name"] }),
      db.District.findByPk(districtId, { attributes: ["name"] }),
      db.Ward.findByPk(wardId, { attributes: ["name"] }),
    ]);

    if (!province || !district || !ward) {
      throw new NotFoundError("Invalid location information");
    }

    return {
      provinceName: province.name,
      districtName: district.name,
      wardName: ward.name,
    };
  }

  async checkout(userId, checkoutData) {
    const {
      fullName,
      phone,
      email,
      address,
      province_id,
      district_id,
      ward_id,
      note,
      paymentMethod,
      shipping_fee = 30000,
    } = checkoutData;

    const cart = await cartService.getCart(userId);
    const cartItems = cart.items || [];

    if (cartItems.length === 0) {
      throw new BadRequestError("Cart is empty");
    }

    const locationNames = await this.getLocationNames(
      province_id,
      district_id,
      ward_id
    );

    let itemsTotal = 0;
    const orderItemsData = [];

    for (const cartItem of cartItems) {
      const variant = cartItem.variant;
      if (!variant) {
        throw new NotFoundError(
          `Product variant not found for cart item ${cartItem.id}`
        );
      }

      if (!variant.is_active || variant.deleted_at) {
        throw new BadRequestError(
          `Product variant ${variant.id} is not available`
        );
      }

      if (variant.stock < cartItem.quantity) {
        throw new BadRequestError(
          `Insufficient stock for product variant ${variant.id}. Available: ${variant.stock}, Requested: ${cartItem.quantity}`
        );
      }

      const product = variant.product;
      if (!product) {
        throw new NotFoundError(`Product not found for variant ${variant.id}`);
      }

      const unitPrice = parseFloat(cartItem.unit_price || variant.price);
      const quantity = cartItem.quantity;
      const subtotal = unitPrice * quantity;

      itemsTotal += subtotal;

      orderItemsData.push({
        product_variant_id: variant.id,
        product_name_snapshot: product.name,
        product_variant_description_snapshot: variant.sku,
        product_sku_snapshot: variant.sku,
        unit_price: unitPrice,
        quantity,
        subtotal,
      });
    }

    const totalAmount = itemsTotal + shipping_fee;
    const orderCode = await this.generateOrderCode();

    const paymentMethodEnum =
      paymentMethod === "cod"
        ? "COD"
        : paymentMethod === "vnpay"
        ? "VNPAY_FAKE"
        : "COD";

    const orderStatus =
      paymentMethod === "cod" ? "CONFIRMED" : "PENDING_PAYMENT";
    const paymentStatus = paymentMethod === "cod" ? "PENDING" : "PENDING";

    const transaction = await db.sequelize.transaction();

    try {
      const order = await db.Order.create(
        {
          user_id: userId,
          order_code: orderCode,
          status: orderStatus,
          shipping_full_name: fullName,
          shipping_phone: phone,
          shipping_address_line: address,
          shipping_province: locationNames.provinceName,
          shipping_district: locationNames.districtName,
          shipping_ward: locationNames.wardName,
          items_total: itemsTotal,
          shipping_fee: shipping_fee,
          total_amount: totalAmount,
          payment_method: paymentMethodEnum,
          payment_status: paymentStatus,
        },
        { transaction }
      );

      await db.OrderItem.bulkCreate(
        orderItemsData.map((item) => ({
          ...item,
          order_id: order.id,
        })),
        { transaction }
      );

      if (paymentMethod === "cod") {
        let cart = await db.Cart.findOne({
          where: { user_id: userId },
          transaction,
        });
        if (cart) {
          await db.CartItem.destroy({
            where: { cart_id: cart.id },
            transaction,
          });
        }
      }

      await transaction.commit();

      const orderWithItems = await db.Order.findByPk(order.id, {
        include: [
          {
            model: db.OrderItem,
            as: "items",
            include: [
              {
                model: db.ProductVariant,
                as: "variant",
                include: [
                  {
                    model: db.Product,
                    as: "product",
                    attributes: ["id", "name", "slug"],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (paymentMethod === "vnpay") {
        const ipAddr = checkoutData.ipAddr || "127.0.0.1";
        const paymentUrl = vnpayService.createPaymentUrl(
          order.id,
          totalAmount,
          orderCode,
          ipAddr
        );

        return {
          order: orderWithItems,
          paymentUrl: paymentUrl,
        };
      }

      return orderWithItems;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getUserOrders(
    userId,
    { page = 1, limit = 10, search, startDate, endDate, status }
  ) {
    const offset = (page - 1) * limit;

    const whereClause = { user_id: userId };

    if (status) {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at[Sequelize.Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.created_at[Sequelize.Op.lte] = endDateTime;
      }
    }

    const orderItemInclude = {
      model: db.OrderItem,
      as: "items",
      required: false,
    };

    if (search) {
      orderItemInclude.where = {
        product_name_snapshot: {
          [Sequelize.Op.like]: `%${search}%`,
        },
      };
      orderItemInclude.required = true;
    }

    const { count, rows } = await db.Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          ...orderItemInclude,
          include: [
            {
              model: db.ProductVariant,
              as: "variant",
              include: [
                
                {
                  model: db.Product,
                  as: "product",
                  attributes: ["id", "name", "slug"],
                  include: [
                    {
                      model: db.ProductImage,
                      as: "images",
                      where: { deleted_at: null },
                      required: false,
                      attributes: ["id", "image_url", "product_option_value_id", "is_primary"],
                    },
                  ],
                },
                {
                  model: db.ProductOptionValue,
                  as: "option_values",
                  through: { attributes: [] },
                  required: false,
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
        },
      ],
      order: [["created_at", "DESC"]],
      distinct: true,
      limit,
      offset,
    });

    return {
      orders: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getOrderById(userId, orderId) {
    const order = await db.Order.findOne({
      where: {
        id: orderId,
        user_id: userId,
      },
      include: [
        {
          model: db.OrderItem,
          as: "items",
          include: [
            {
              model: db.ProductVariant,
              as: "variant",
              include: [
                {
                  model: db.Product,
                  as: "product",
                  attributes: ["id", "name", "slug"],
                  include: [
                    {
                      model: db.ProductImage,
                      as: "images",
                      where: { deleted_at: null },
                      required: false,
                      attributes: ["id", "image_url", "product_option_value_id", "is_primary"],
                    },
                  ],
                },
                {
                  model: db.ProductOptionValue,
                  as: "option_values",
                  through: { attributes: [] },
                  required: false,
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
        },
        {
          model: db.PaymentTransaction,
          as: "transactions",
          limit: 1,
          order: [["created_at", "DESC"]],
        },
      ],
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return order;
  }

  async cancelOrder(userId, orderId) {
    const order = await db.Order.findOne({
      where: {
        id: orderId,
        user_id: userId,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (
      order.status !== "PENDING_PAYMENT" &&
      order.status !== "CONFIRMED" &&
      order.status !== "PAYMENT_FAILED"
    ) {
      throw new BadRequestError(
        "Only orders with PENDING_PAYMENT, CONFIRMED or PAYMENT_FAILED status can be cancelled"
      );
    }

    if (order.status === "CANCELLED") {
      throw new BadRequestError("Order is already cancelled");
    }

    await order.update({
      status: "CANCELLED",
      cancelled_at: new Date(),
    });

    return order;
  }

  async confirmOrderReceived(userId, orderId) {
    const order = await db.Order.findOne({
      where: {
        id: orderId,
        user_id: userId,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.status !== "SHIPPING") {
      throw new BadRequestError(
        "Only orders with SHIPPING status can be confirmed as received"
      );
    }

    const updateData = {
      status: "COMPLETED",
    };

    if (order.payment_method === "COD" && order.payment_status === "PENDING") {
      updateData.payment_status = "SUCCESS";
      updateData.paid_at = new Date();
    }

    await order.update(updateData);

    return order;
  }
}

module.exports = new OrderService();

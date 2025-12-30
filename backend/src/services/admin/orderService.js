const db = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError, BadRequestError } = require("../../utils/ApiError");

class OrderService {
  async getAllOrders({ page = 1, limit = 10, search, startDate, endDate, status }) {
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.created_at[Op.lte] = endDateTime;
      }
    }

    const includeClause = [
      {
        model: db.User,
        as: "user",
        attributes: ["id", "full_name", "email", "phone"],
        required: true,
      },
      {
        model: db.OrderItem,
        as: "items",
        required: false,
        include: [
          {
            model: db.ProductVariant,
            as: "variant",
            required: false,
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
    ];

    if (search) {
      whereClause[Op.or] = [
        { order_code: { [Op.like]: `%${search}%` } },
        { shipping_full_name: { [Op.like]: `%${search}%` } },
        { shipping_phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await db.Order.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [["created_at", "DESC"]],
      distinct: true,
      limit,
      offset,
    });

    return {
      orders: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit),
      },
    };
  }

  async getOrderById(orderId) {
    const order = await db.Order.findByPk(orderId, {
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "full_name", "email", "phone"],
        },
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
      ],
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return order;
  }

  async updateOrderStatus(orderId, newStatus) {
    const order = await db.Order.findByPk(orderId);

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const validStatuses = [
      "PENDING_PAYMENT",
      "CONFIRMED",
      "PAID",
      "SHIPPING",
      "COMPLETED",
      "CANCELLED",
      "PAYMENT_FAILED",
    ];

    if (!validStatuses.includes(newStatus)) {
      throw new BadRequestError(`Invalid status: ${newStatus}`);
    }

    const currentStatus = order.status;

    if (currentStatus === newStatus) {
      throw new BadRequestError(`Order is already ${newStatus}`);
    }

    if (currentStatus === "CANCELLED") {
      throw new BadRequestError("Cannot update status of a cancelled order");
    }

    if (currentStatus === "COMPLETED") {
      throw new BadRequestError("Cannot update status of a completed order");
    }

    const statusFlow = {
      PENDING_PAYMENT: ["CONFIRMED", "PAID", "CANCELLED", "PAYMENT_FAILED"],
      CONFIRMED: ["PAID", "SHIPPING", "CANCELLED"],
      PAID: ["SHIPPING", "CANCELLED"],
      SHIPPING: ["COMPLETED"],
      PAYMENT_FAILED: ["PENDING_PAYMENT", "CANCELLED"],
    };

    const allowedNextStatuses = statusFlow[currentStatus] || [];

    if (!allowedNextStatuses.includes(newStatus)) {
      throw new BadRequestError(
        `Cannot change status from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedNextStatuses.join(", ")}`
      );
    }

    const updateData = {
      status: newStatus,
    };

    if (newStatus === "PAID" && order.payment_status === "PENDING") {
      updateData.payment_status = "SUCCESS";
      updateData.paid_at = new Date();
    }

    if (newStatus === "CANCELLED") {
      updateData.cancelled_at = new Date();
    }

    await order.update(updateData);

    return order;
  }
}

module.exports = new OrderService();

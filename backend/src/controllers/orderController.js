const orderService = require("../services/orderService");
const {
  responseOk,
  responseOkWithPagination,
} = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

class OrderController {
  checkout = asyncHandler(async (req, res) => {
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.ip ||
      "127.0.0.1";
    const checkoutData = {
      ...req.body,
      ipAddr: ipAddr.split(",")[0].trim(),
    };
    const result = await orderService.checkout(req.user.id, checkoutData);
    return responseOk(res, result, "Order created successfully");
  });

  getUserOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || null;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    const status = req.query.status || null;
    const result = await orderService.getUserOrders(req.user.id, {
      page,
      limit,
      search,
      startDate,
      endDate,
      status,
    });
    return responseOkWithPagination(
      res,
      result.orders,
      result.pagination,
      "Orders fetched successfully"
    );
  });

  getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }
    const result = await orderService.getOrderById(req.user.id, orderId);
    return responseOk(res, result, "Order fetched successfully");
  });

  cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }
    const result = await orderService.cancelOrder(req.user.id, orderId);
    return responseOk(res, result, "Order cancelled successfully");
  });

  confirmOrderReceived = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }
    const result = await orderService.confirmOrderReceived(
      req.user.id,
      orderId
    );
    return responseOk(res, result, "Order confirmed as received successfully");
  });
}

module.exports = new OrderController();

const orderService = require("../../services/admin/orderService");
const { responseOk, responseOkWithPagination } = require("../../utils/apiResponse");
const asyncHandler = require("../../middlewares/asyncHandler");

class OrderController {
  getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || null;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    const status = req.query.status || null;

    const result = await orderService.getAllOrders({
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
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await orderService.getOrderById(orderId);
    return responseOk(res, order, "Order fetched successfully");
  });

  updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const order = await orderService.updateOrderStatus(orderId, status);
    return responseOk(res, order, "Order status updated successfully");
  });
}

module.exports = new OrderController();

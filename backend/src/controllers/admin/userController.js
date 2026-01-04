const userService = require("../../services/admin/userService");
const { responseOk, responseOkWithPagination } = require("../../utils/apiResponse");
const asyncHandler = require("../../middlewares/asyncHandler");

class UserController {
  getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || null;
    const role = req.query.role || null;
    const is_active = req.query.is_active !== undefined ? req.query.is_active === "true" || req.query.is_active === true : null;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    const result = await userService.getAllUsers({
      page,
      limit,
      search,
      role,
      is_active,
      startDate,
      endDate,
    });

    return responseOkWithPagination(
      res,
      result.users,
      result.pagination,
      "Users fetched successfully"
    );
  });

  getUserStats = asyncHandler(async (req, res) => {
    const stats = await userService.getUserStats();
    return responseOk(res, stats, "User stats fetched successfully");
  });

  getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await userService.getUserById(userId);
    return responseOk(res, user, "User fetched successfully");
  });

  updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    const currentUserId = req.user?.id;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await userService.updateUser(userId, req.body, currentUserId);
    return responseOk(res, user, "User updated successfully");
  });
}

module.exports = new UserController();

const dashboardService = require("../../services/admin/dashboardService");
const { responseOk } = require("../../utils/apiResponse");
const asyncHandler = require("../../middlewares/asyncHandler");

class DashboardController {
  getStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getDashboardStats();
    return responseOk(
      res,
      stats,
      "Dashboard statistics retrieved successfully"
    );
  });
}

module.exports = new DashboardController();

const categoryService = require("../services/categoryService");
const { responseOkWithPagination, responseOk } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

class CategoryController {
  // GET /api/categories - Lấy danh sách categories (public)
  getAll = asyncHandler(async (req, res) => {
    const { categories, pagination } = await categoryService.getAll(req.query);
    return responseOkWithPagination(
      res,
      categories,
      pagination,
      "Categories retrieved successfully"
    );
  });

  // GET /api/categories/:slug - Lấy chi tiết category (public)
  getBySlug = asyncHandler(async (req, res) => {
    const category = await categoryService.getBySlug(req.params.slug);
    return responseOk(res, category, "Category retrieved successfully");
  });
}

module.exports = new CategoryController();

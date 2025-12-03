const categoryService = require("../services/categoryService");
const {
  responseOk,
  responseOkWithPagination,
} = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const { HTTP_STATUS } = require("../constants");

class CategoryController {
  getAll = asyncHandler(async (req, res) => {
    const { categories, pagination } = await categoryService.getAll(req.query);
    return responseOkWithPagination(
      res,
      categories,
      pagination,
      "Categories retrieved successfully"
    );
  });

  getBySlug = asyncHandler(async (req, res) => {
    const category = await categoryService.getBySlug(req.params.slug);
    return responseOk(res, category, "Category retrieved successfully");
  });

  create = asyncHandler(async (req, res) => {
    const category = await categoryService.create(req.body);
    return responseOk(
      res,
      category,
      "Category created successfully",
      HTTP_STATUS.CREATED
    );
  });

  update = asyncHandler(async (req, res) => {
    const category = await categoryService.update(req.params.slug, req.body);
    return responseOk(res, category, "Category updated successfully");
  });

  delete = asyncHandler(async (req, res) => {
    const result = await categoryService.delete(req.params.slug);
    return responseOk(res, result, "Category deleted successfully");
  });
}

module.exports = new CategoryController();

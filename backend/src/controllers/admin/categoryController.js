const categoryAdminService = require("../../services/admin/categoryService");
const { responseOk, responseOkWithPagination } = require("../../utils/apiResponse");
const asyncHandler = require("../../middlewares/asyncHandler");

class CategoryAdminController {
    /**
     * GET /api/admin/categories
     * Lấy danh sách categories với phân trang và tìm kiếm
     */
    getAllCategories = asyncHandler(async (req, res) => {
        const result = await categoryAdminService.getAllCategories(req.query);
        return responseOkWithPagination(
            res,
            result.categories,
            result.pagination,
            "Get categories successfully"
        );
    });

    /**
     * GET /api/admin/categories/tree
     * Lấy danh sách categories dạng cây
     */
    getCategoryTree = asyncHandler(async (req, res) => {
        const tree = await categoryAdminService.getCategoryTree();
        return responseOk(res, tree, "Get category tree successfully");
    });

    /**
     * GET /api/admin/categories/stats
     * Lấy thống kê categories
     */
    getCategoryStats = asyncHandler(async (req, res) => {
        const stats = await categoryAdminService.getCategoryStats();
        return responseOk(res, stats, "Get category statistics successfully");
    });

    /**
     * GET /api/admin/categories/:id
     * Lấy thông tin chi tiết một category
     */
    getCategoryById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const category = await categoryAdminService.getCategoryById(id);
        return responseOk(res, category, "Get category successfully");
    });

    /**
     * POST /api/admin/categories
     * Tạo category mới
     */
    createCategory = asyncHandler(async (req, res) => {
        const category = await categoryAdminService.createCategory(req.body);
        return responseOk(res, category, "Category created successfully", 201);
    });

    /**
     * PUT /api/admin/categories/:id
     * Cập nhật category
     */
    updateCategory = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const category = await categoryAdminService.updateCategory(id, req.body);
        return responseOk(res, category, "Category updated successfully");
    });

    /**
     * DELETE /api/admin/categories/:id
     * Xóa category (soft delete)
     */
    deleteCategory = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await categoryAdminService.deleteCategory(id);
        return responseOk(res, null, "Category deleted successfully");
    });

    /**
     * PATCH /api/admin/categories/:id/toggle-active
     * Kích hoạt/vô hiệu hóa category
     */
    toggleActiveStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { is_active } = req.body;
        const category = await categoryAdminService.toggleActiveStatus(id, is_active);
        return responseOk(
            res,
            category,
            `Category ${is_active ? "activated" : "deactivated"} successfully`
        );
    });
}

module.exports = new CategoryAdminController();

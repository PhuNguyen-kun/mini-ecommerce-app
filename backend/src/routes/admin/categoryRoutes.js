const express = require("express");
const router = express.Router();

const categoryAdminController = require("../../controllers/admin/categoryController");
const {
    validateCreateCategory,
    validateUpdateCategory,
    validateToggleActive,
} = require("../../validators/categoryValidator");

const { authMiddleware, requireAdmin } = require("../../middlewares/auth");

// Tất cả routes dưới đây đều yêu cầu admin
router.use(authMiddleware, requireAdmin);

/**
 * GET /api/admin/categories/tree
 * Lấy danh sách categories dạng cây
 * Note: Route đặc biệt phải đặt trước route /:id
 */
router.get("/tree", categoryAdminController.getCategoryTree);

/**
 * GET /api/admin/categories/stats
 * Lấy thống kê categories
 */
router.get("/stats", categoryAdminController.getCategoryStats);

/**
 * GET /api/admin/categories
 * Lấy danh sách categories với phân trang và tìm kiếm
 * Query params: page, limit, search, is_active, parent_id
 */
router.get("/", categoryAdminController.getAllCategories);

/**
 * GET /api/admin/categories/:id
 * Lấy thông tin chi tiết một category
 */
router.get("/:id", categoryAdminController.getCategoryById);

/**
 * POST /api/admin/categories
 * Tạo category mới
 * Body: { name, description?, parent_id?, is_active? }
 */
router.post(
    "/",
    validateCreateCategory,
    categoryAdminController.createCategory
);

/**
 * PUT /api/admin/categories/:id
 * Cập nhật category
 * Body: { name?, description?, parent_id?, is_active? }
 */
router.put(
    "/:id",
    validateUpdateCategory,
    categoryAdminController.updateCategory
);

/**
 * PATCH /api/admin/categories/:id/toggle-active
 * Kích hoạt/vô hiệu hóa category
 * Body: { is_active: boolean }
 */
router.patch(
    "/:id/toggle-active",
    validateToggleActive,
    categoryAdminController.toggleActiveStatus
);

/**
 * DELETE /api/admin/categories/:id
 * Xóa category (soft delete)
 */
router.delete("/:id", categoryAdminController.deleteCategory);

module.exports = router;

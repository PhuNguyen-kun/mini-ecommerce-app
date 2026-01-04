const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { validateGetAllCategories } = require("../validators/categoryValidator");

/**
 * Public routes - Chỉ READ-ONLY
 * Admin CRUD operations đã được chuyển sang /api/admin/categories
 */

// GET /api/categories - Lấy danh sách categories
router.get("/", validateGetAllCategories, categoryController.getAll);

// GET /api/categories/:slug - Lấy chi tiết category
router.get("/:slug", categoryController.getBySlug);

module.exports = router;

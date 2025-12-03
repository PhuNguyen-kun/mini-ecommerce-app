const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authMiddleware, requireAdmin } = require("../middlewares/auth");
const {
  validateGetAllCategories,
  validateCreateCategory,
  validateUpdateCategory,
} = require("../validators/categoryValidator");

router.get("/", validateGetAllCategories, categoryController.getAll);
router.get("/:slug", categoryController.getBySlug);
router.post(
  "/",
  authMiddleware,
  requireAdmin,
  validateCreateCategory,
  categoryController.create
);
router.put(
  "/:slug",
  authMiddleware,
  requireAdmin,
  validateUpdateCategory,
  categoryController.update
);
router.delete(
  "/:slug",
  authMiddleware,
  requireAdmin,
  categoryController.delete
);

module.exports = router;

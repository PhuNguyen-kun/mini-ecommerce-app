const express = require("express");
const router = express.Router();

const userController = require("../../controllers/admin/userController");
const { authMiddleware, requireAdmin } = require("../../middlewares/auth");

// Tất cả routes dưới đây đều admin
router.use(authMiddleware, requireAdmin);

/**
 * Admin user routes
 * Các routes cho quản lý người dùng
 */

// TODO: Thêm các routes quản lý người dùng tại đây
// Ví dụ:
// router.get("/", userController.getAllUsers);
// router.get("/:id", userController.getUserById);
// router.put("/:id", userController.updateUser);
// router.delete("/:id", userController.deleteUser);

module.exports = router;

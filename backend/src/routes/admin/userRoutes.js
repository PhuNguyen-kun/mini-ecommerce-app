const express = require("express");
const router = express.Router();

const userController = require("../../controllers/admin/userController");
const { authMiddleware, requireAdmin } = require("../../middlewares/auth");
const { validateUpdateUser } = require("../../validators/admin/userValidator");

router.use(authMiddleware, requireAdmin);

router.get("/", userController.getAllUsers);
router.get("/stats", userController.getUserStats);
router.get("/:id", userController.getUserById);
router.put("/:id", validateUpdateUser, userController.updateUser);

module.exports = router;

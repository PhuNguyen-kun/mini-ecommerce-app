const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/auth");
const { uploadAvatar } = require("../middlewares/upload");
const { validateUpdateProfile } = require("../validators/userValidator");

// Profile routes
router.put("/me", authMiddleware, validateUpdateProfile, userController.updateProfile);

// Avatar routes
router.post("/me/avatar", authMiddleware, uploadAvatar, userController.uploadAvatar);
router.delete("/me/avatar", authMiddleware, userController.deleteAvatar);

module.exports = router;

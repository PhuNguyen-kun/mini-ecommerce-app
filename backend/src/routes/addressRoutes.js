const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { authMiddleware } = require("../middlewares/auth");
const { validateAddress } = require("../validators/addressValidator");

router.use(authMiddleware); // Yêu cầu đăng nhập toàn bộ

router.get("/", addressController.getAll);
router.post("/", validateAddress, addressController.create);
router.put("/:id", validateAddress, addressController.update);
router.delete("/:id", addressController.delete);
router.patch("/:id/default", addressController.setDefault); // API set default nhanh

module.exports = router;
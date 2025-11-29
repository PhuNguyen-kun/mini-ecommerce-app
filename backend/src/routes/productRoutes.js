const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { validateFilterProduct, validateCreateProduct, validateUpdateProduct } = require("../validators/productValidator");
const { authMiddleware, requireAdmin } = require("../middlewares/auth");

// Public Routes (Ai cũng xem được)
router.get("/", validateFilterProduct, productController.getProducts);
router.get("/:slug", productController.getProductBySlug);

// Admin Routes (Cần đăng nhập + Quyền Admin)
router.post(
    "/",
    authMiddleware,         // 1. Check Login
    requireAdmin,           // 2. Check Admin
    validateCreateProduct,  // 3. Check Data đầu vào
    productController.createProduct // 4. Xử lý
);


router.put(
    "/:id",
    authMiddleware,         // 1. Check Login
    requireAdmin,           // 2. Check Admin
    validateUpdateProduct,  // 3. Check Data đầu vào
    productController.updateProduct // 4. Xử lý
)

router.delete(
    "/:id",
    authMiddleware,         // 1. Check Login
    requireAdmin,           // 2. Check Admin
    productController.deleteProduct // 4. Xử lý
)

module.exports = router;
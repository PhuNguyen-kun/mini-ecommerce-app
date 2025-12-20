const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

const {
    validateFilterProduct,
    validateCreateProduct,
    validateUpdateProduct,
    validateAddMedia,
} = require("../validators/productValidator");

const { authMiddleware, requireAdmin } = require("../middlewares/auth");
const { uploadProductFiles, handleUploadError } = require("../middlewares/upload");
const { parseProductMediaFormData } = require("../middlewares/productFormData");

// ======================
// CLIENT / PUBLIC
// ======================
router.get("/", validateFilterProduct, productController.getProducts);
router.get("/:slug", productController.getProductBySlug);

// ======================
// ADMIN / PRIVATE
// ======================
router.use(authMiddleware, requireAdmin);

/**
 * (ADMIN) 1) Create product (JSON)
 * - KHÔNG upload files tại đây
 */
router.post(
    "/admin",
    validateCreateProduct,
    productController.createProduct
);

/**
 * (ADMIN) 2) Upload media cho product đã có ID (FORM-DATA)
 * - field: images[] , videos[]
 * - Lưu DB ProductImage/ProductVideo
 */
router.post(
    "/admin/:id/media",
    uploadProductFiles,
    handleUploadError,
    parseProductMediaFormData,
    validateAddMedia,
    productController.addProductMedia
);

/**
 * (ADMIN) 3) Update product basic info/variants (JSON)
 * - KHÔNG upload ở đây (media có API riêng)
 */
router.put(
    "/admin/:id",
    validateUpdateProduct,
    productController.updateProduct
);

// Delete product
router.delete("/admin/:id", productController.deleteProduct);

// Delete single image/video
router.delete("/admin/images/:id", productController.deleteImage);
router.delete("/admin/videos/:id", productController.deleteVideo);

// OPTIONAL: gán ảnh cho variant (không làm cũng không sao)
router.post("/admin/variants/image", productController.setVariantImage);

module.exports = router;

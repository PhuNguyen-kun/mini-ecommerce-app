const express = require("express");
const router = express.Router();

const productAdminController = require("../../controllers/admin/productController");

const {
    validateCreateProduct,
    validateUpdateProduct,
    validateAddMedia,
} = require("../../validators/productValidator");

const { authMiddleware, requireAdmin } = require("../../middlewares/auth");
const { uploadProductFiles, handleUploadError } = require("../../middlewares/upload");
const { parseProductMediaFormData } = require("../../middlewares/productFormData");

// Tất cả routes dưới đây đều admin
router.use(authMiddleware, requireAdmin);

/**
 * (ADMIN) 1) Create product (JSON)
 * POST /api/admin/products
 */
router.post(
    "/",
    validateCreateProduct,
    productAdminController.createProduct
);

/**
 * (ADMIN) 2) Upload media (FORM-DATA)
 * POST /api/admin/products/:id/media
 */
router.post(
    "/:id/media",
    uploadProductFiles,
    handleUploadError,
    parseProductMediaFormData,
    validateAddMedia,
    productAdminController.addProductMedia
);

/**
 * (ADMIN) 3) Update product basic info/variants (JSON)
 * PUT /api/admin/products/:id
 */
router.put(
    "/:id",
    validateUpdateProduct,
    productAdminController.updateProduct
);

/**
 * DELETE /api/admin/products/:id
 */
router.delete("/:id", productAdminController.deleteProduct);

/**
 * DELETE /api/admin/products/images/:id
 * DELETE /api/admin/products/videos/:id
 */
router.delete("/images/:id", productAdminController.deleteImage);
router.delete("/videos/:id", productAdminController.deleteVideo);

/**
 * POST /api/admin/products/options/image
 */
router.post("/options/image", productAdminController.setOptionImage);

module.exports = router;

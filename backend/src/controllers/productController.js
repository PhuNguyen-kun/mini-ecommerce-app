const productService = require("../services/productService");
const { responseOk } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const { deleteMultipleFiles } = require("../utils/cloudinaryHelper");

class ProductController {
    // ======================
    // CLIENT / PUBLIC
    // ======================

    // GET /api/products
    getProducts = asyncHandler(async (req, res) => {
        const result = await productService.getProducts(req.query);
        return responseOk(res, result, "Get products list successfully");
    });

    // GET /api/products/:slug
    getProductBySlug = asyncHandler(async (req, res) => {
        const { slug } = req.params;
        const result = await productService.getProductBySlug(slug);
        return responseOk(res, result, "Get product detail successfully");
    });

    // ======================
    // ADMIN / PRIVATE
    // ======================

    /**
     * (ADMIN) Create product (JSON-only)
     * POST /api/products/admin
     *
     * Body: { name, options[], variants[], ... }
     * NOTE: Không upload ảnh/video ở đây nữa.
     * Quy trình chuẩn: tạo product xong -> gọi API upload media riêng.
     */
    createProduct = asyncHandler(async (req, res) => {
        const result = await productService.createProduct(req.body);
        return responseOk(res, result, "Product created successfully", 201);
    });

    /**
     * (ADMIN) Upload media cho product đã có id
     * POST /api/products/admin/:id/media
     *
     * form-data:
     *  - images[] (optional)
     *  - videos[] (optional)
     *
     * Middleware upload sẽ upload lên Cloudinary trước,
     * parseProductMediaFormData sẽ map req.files -> req.body.images/videos
     *
     * Nếu DB lưu fail => rollback xóa Cloudinary file vừa upload.
     */
    addProductMedia = asyncHandler(async (req, res) => {

        const { id } = req.params;

        // req.body.images/videos đã được middleware map vào
        const result = await productService.addProductMedia(id, req.body);

        return responseOk(res, result, "Upload media successfully", 201);

    });

    /**
     * (ADMIN) Update product info/variants (JSON-only)
     * PUT /api/products/admin/:id
     *
     * NOTE: Không upload ở đây nữa (media có API riêng)
     */
    updateProduct = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await productService.updateProduct(id, req.body);
        return responseOk(res, result, "Product updated successfully");
    });

    // DELETE /api/products/admin/:id
    deleteProduct = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await productService.deleteProduct(id);
        return responseOk(res, null, "Product deleted successfully");
    });

    // DELETE /api/products/admin/images/:id
    deleteImage = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await productService.deleteProductImage(id);
        return responseOk(res, null, "Image deleted successfully");
    });

    // DELETE /api/products/admin/videos/:id
    deleteVideo = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await productService.deleteProductVideo(id);
        return responseOk(res, null, "Video deleted successfully");
    });

    /**
     * (ADMIN - OPTIONAL) Gán ảnh cho Variant (single/batch)
     * POST /api/products/admin/variants/image
     *
     * Single:
     *   Body: { variantId, imageId }
     *
     * Batch:
     *   Body: { pairs: [{ variantId, imageId }, ...] }
     *
     * Không gọi Cloudinary, chỉ update DB: product_images.product_variant_id
     */
    setVariantImage = asyncHandler(async (req, res) => {
        const result = await productService.setVariantImage(req.body);
        return responseOk(res, result, result.message || "Variant image updated successfully");
    });
}
module.exports = new ProductController();

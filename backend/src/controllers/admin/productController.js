const productAdminService = require("../../services/admin/productService");
const { responseOk } = require("../../utils/apiResponse");
const asyncHandler = require("../../middlewares/asyncHandler");

class ProductAdminController {
    // POST /api/admin/products
    createProduct = asyncHandler(async (req, res) => {
        const result = await productAdminService.createProduct(req.body);
        return responseOk(res, result, "Product created successfully", 201);
    });

    // POST /api/admin/products/:id/media
    addProductMedia = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await productAdminService.addProductMedia(id, req.body);
        return responseOk(res, result, "Upload media successfully", 201);
    });

    // PUT /api/admin/products/:id
    updateProduct = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await productAdminService.updateProduct(id, req.body);
        return responseOk(res, result, "Product updated successfully");
    });

    // DELETE /api/admin/products/:id
    deleteProduct = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await productAdminService.deleteProduct(id);
        return responseOk(res, null, "Product deleted successfully");
    });

    // DELETE /api/admin/products/images/:id
    deleteImage = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await productAdminService.deleteProductImage(id);
        return responseOk(res, null, "Image deleted successfully");
    });

    // DELETE /api/admin/products/videos/:id
    deleteVideo = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await productAdminService.deleteProductVideo(id);
        return responseOk(res, null, "Video deleted successfully");
    });

    // POST /api/admin/products/variants/image
    setOptionImage = asyncHandler(async (req, res) => {
        // Gọi hàm mới: setOptionImage
        const result = await productAdminService.setOptionImage(req.body);
        return responseOk(res, result, "Gán ảnh theo phân loại thành công");
    });
}

module.exports = new ProductAdminController();

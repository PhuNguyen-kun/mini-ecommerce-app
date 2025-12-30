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

}
module.exports = new ProductController();

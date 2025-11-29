const productService = require("../services/productService");
const { responseOk } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

class ProductController {
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

    // POST /api/products
    createProduct = asyncHandler(async (req, res) => {
        // req.body đã được validate sạch sẽ bởi Joi middleware trước đó
        const result = await productService.createProduct(req.body);
        return responseOk(res, result, "Product created successfully", 201);
    })

    // PUT /api/products/:id
    updateProduct = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await productService.updateProduct(id, req.body);
        return responseOk(res, result, "Product updated successfully");
    });

    // DELETE /api/products/:id
    deleteProduct = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await productService.deleteProduct(id);
        return responseOk(res, null, "Product deleted successfully");
    })
}

module.exports = new ProductController();
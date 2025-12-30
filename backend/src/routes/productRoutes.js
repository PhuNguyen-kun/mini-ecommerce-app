const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { validateFilterProduct } = require("../validators/productValidator");

// ======================
// CLIENT / PUBLIC
// ======================
router.get("/", validateFilterProduct, productController.getProducts);
router.get("/:slug", productController.getProductBySlug);

module.exports = router;

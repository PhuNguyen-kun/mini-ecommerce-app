"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Categories
    await queryInterface.bulkInsert("categories", [
      {
        id: 1,
        name: "Áo Nam",
        slug: "ao-nam",
        parent_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 2. Products (Sản phẩm Gốc)
    await queryInterface.bulkInsert("products", [
      {
        id: 1,
        category_id: 1,
        name: "Áo Thun Basic Cotton",
        slug: "ao-thun-basic-cotton",
        gender: "male",
        description: "Áo thun chất liệu 100% cotton thoáng mát.",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 3. Product Options (Định nghĩa thuộc tính)
    await queryInterface.bulkInsert("product_options", [
      { id: 1, product_id: 1, name: "Màu sắc" },
      { id: 2, product_id: 1, name: "Kích cỡ" },
    ]);

    // 4. Product Option Values (Giá trị thuộc tính)
    await queryInterface.bulkInsert("product_option_values", [
      { id: 1, product_option_id: 1, value: "Đen" }, // ID 1: Màu Đen
      { id: 2, product_option_id: 1, value: "Trắng" }, // ID 2: Màu Trắng
      { id: 3, product_option_id: 2, value: "M" },   // ID 3: Size M
      { id: 4, product_option_id: 2, value: "L" },   // ID 4: Size L
    ]);

    // 5. Product Variants (SKU bán hàng) - Tạo 4 biến thể
    await queryInterface.bulkInsert("product_variants", [
      // Đen - M
      { id: 1, product_id: 1, sku: "AT-DEN-M", price: 100000, stock: 50, created_at: new Date(), updated_at: new Date() },
      // Đen - L
      { id: 2, product_id: 1, sku: "AT-DEN-L", price: 100000, stock: 20, created_at: new Date(), updated_at: new Date() },
      // Trắng - M
      { id: 3, product_id: 1, sku: "AT-TRANG-M", price: 120000, stock: 0, created_at: new Date(), updated_at: new Date() }, // Hết hàng
      // Trắng - L
      { id: 4, product_id: 1, sku: "AT-TRANG-L", price: 120000, stock: 10, created_at: new Date(), updated_at: new Date() },
    ]);

    // 6. Product Variant Options (Bảng nối: Mapping Variant với Value)
    await queryInterface.bulkInsert("product_variant_options", [
      // Variant 1 (Đen - M)
      { product_variant_id: 1, product_option_value_id: 1 }, // Đen
      { product_variant_id: 1, product_option_value_id: 3 }, // M

      // Variant 2 (Đen - L)
      { product_variant_id: 2, product_option_value_id: 1 }, // Đen
      { product_variant_id: 2, product_option_value_id: 4 }, // L

      // Variant 3 (Trắng - M)
      { product_variant_id: 3, product_option_value_id: 2 }, // Trắng
      { product_variant_id: 3, product_option_value_id: 3 }, // M

      // Variant 4 (Trắng - L)
      { product_variant_id: 4, product_option_value_id: 2 }, // Trắng
      { product_variant_id: 4, product_option_value_id: 4 }, // L
    ]);

    // 7. Product Images
    await queryInterface.bulkInsert("product_images", [
      { product_id: 1, product_variant_id: null, image_url: "https://via.placeholder.com/500x500?text=Ao+Chung", is_primary: true },
      { product_id: 1, product_variant_id: 1, image_url: "https://via.placeholder.com/500x500?text=Mau+Den", is_primary: false },
      { product_id: 1, product_variant_id: 3, image_url: "https://via.placeholder.com/500x500?text=Mau+Trang", is_primary: false },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_images", null, {});
    await queryInterface.bulkDelete("product_variant_options", null, {});
    await queryInterface.bulkDelete("product_variants", null, {});
    await queryInterface.bulkDelete("product_option_values", null, {});
    await queryInterface.bulkDelete("product_options", null, {});
    await queryInterface.bulkDelete("products", null, {});
    await queryInterface.bulkDelete("categories", null, {});
  },
};
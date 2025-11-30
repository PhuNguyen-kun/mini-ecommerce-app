"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Categories
    await queryInterface.bulkInsert("categories", [
      { id: 1, name: "Áo Nam", slug: "ao-nam", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 2, name: "Quần Nam", slug: "quan-nam", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 3, name: "Áo Nữ", slug: "ao-nu", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 4, name: "Quần Nữ", slug: "quan-nu", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 5, name: "Phụ Kiện", slug: "phu-kien", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 6, name: "Áo Khoác", slug: "ao-khoac", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
    ]);

    // 2. Products
    await queryInterface.bulkInsert("products", [
      // Men's Products
      { id: 1, category_id: 1, name: "Áo Thun Basic Cotton", slug: "ao-thun-basic-cotton", gender: "male", description: "Áo thun chất liệu 100% cotton thoáng mát.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 2, category_id: 1, name: "Áo Polo Classic", slug: "ao-polo-classic", gender: "male", description: "Áo polo thiết kế trẻ trung, năng động.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 3, category_id: 1, name: "Áo Sơ Mi Oxford", slug: "ao-so-mi-oxford", gender: "male", description: "Áo sơ mi cao cấp phong cách công sở.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 4, category_id: 2, name: "Quần Jean Slim Fit", slug: "quan-jean-slim-fit", gender: "male", description: "Quần jean co giãn ôm vừa vặn.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 5, category_id: 2, name: "Quần Kaki Slim", slug: "quan-kaki-slim", gender: "male", description: "Quần kaki công sở thanh lịch.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 6, category_id: 6, name: "Áo Khoác Hoodie", slug: "ao-khoac-hoodie", gender: "male", description: "Áo khoác hoodie ấm áp phong cách streetwear.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 7, category_id: 6, name: "Áo Khoác Bomber", slug: "ao-khoac-bomber", gender: "male", description: "Áo khoác bomber thời trang năng động.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 8, category_id: 1, name: "Áo Thun Oversize", slug: "ao-thun-oversize", gender: "male", description: "Áo thun form rộng phong cách Hàn Quốc.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Women's Products
      { id: 9, category_id: 3, name: "Áo Thun Nữ Basic", slug: "ao-thun-nu-basic", gender: "female", description: "Áo thun nữ basic thoải mái.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 10, category_id: 3, name: "Áo Kiểu Nữ", slug: "ao-kieu-nu", gender: "female", description: "Áo kiểu nữ thanh lịch sang trọng.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 11, category_id: 3, name: "Áo Sơ Mi Nữ", slug: "ao-so-mi-nu", gender: "female", description: "Áo sơ mi nữ công sở thanh lịch.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 12, category_id: 4, name: "Quần Jean Nữ Skinny", slug: "quan-jean-nu-skinny", gender: "female", description: "Quần jean nữ skinny ôm dáng.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 13, category_id: 4, name: "Quần Tây Nữ", slug: "quan-tay-nu", gender: "female", description: "Quần tây nữ thanh lịch công sở.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 14, category_id: 6, name: "Áo Khoác Cardigan Nữ", slug: "ao-khoac-cardigan-nu", gender: "female", description: "Áo khoác cardigan nữ duyên dáng.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 15, category_id: 3, name: "Áo Croptop", slug: "ao-croptop", gender: "female", description: "Áo croptop năng động trẻ trung.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 16, category_id: 4, name: "Váy Jean", slug: "vay-jean", gender: "female", description: "Váy jean trẻ trung cá tính.", is_active: true, created_at: new Date(), updated_at: new Date() },
    ]);

    // 3. Product Options
    const productOptions = [];
    for (let i = 1; i <= 16; i++) {
      productOptions.push(
        { id: i * 2 - 1, product_id: i, name: "Màu sắc" },
        { id: i * 2, product_id: i, name: "Kích cỡ" }
      );
    }
    await queryInterface.bulkInsert("product_options", productOptions);

    // 4. Product Option Values
    let optionValueId = 1;
    const productOptionValues = [];
    
    // Colors: Đen, Trắng, Xanh Navy, Xám, Đỏ, Xanh Dương, Be, Hồng
    const colors = ["Đen", "Trắng", "Xanh Navy", "Xám", "Đỏ", "Xanh Dương", "Be", "Hồng"];
    // Sizes: S, M, L, XL, XXL
    const sizes = ["S", "M", "L", "XL", "XXL"];
    
    for (let productId = 1; productId <= 16; productId++) {
      const colorOptionId = productId * 2 - 1;
      const sizeOptionId = productId * 2;
      
      // Add 4-6 random colors per product
      const numColors = 4 + Math.floor(Math.random() * 3);
      const selectedColors = colors.slice(0, numColors);
      selectedColors.forEach(color => {
        productOptionValues.push({
          id: optionValueId++,
          product_option_id: colorOptionId,
          value: color
        });
      });
      
      // Add all sizes
      sizes.forEach(size => {
        productOptionValues.push({
          id: optionValueId++,
          product_option_id: sizeOptionId,
          value: size
        });
      });
    }
    await queryInterface.bulkInsert("product_option_values", productOptionValues);

    // 5. Product Variants
    let variantId = 1;
    const productVariants = [];
    const variantOptions = [];
    const productImages = [];
    
    for (let productId = 1; productId <= 16; productId++) {
      const colorOptionId = productId * 2 - 1;
      const sizeOptionId = productId * 2;
      
      // Get color and size values for this product
      const productColors = productOptionValues.filter(v => v.product_option_id === colorOptionId);
      const productSizes = productOptionValues.filter(v => v.product_option_id === sizeOptionId);
      
      // Base price varies by product
      const basePrice = 100000 + (productId * 50000);
      
      // Create variants for each color-size combination
      productColors.forEach((color, colorIdx) => {
        productSizes.forEach((size, sizeIdx) => {
          const priceVariation = Math.floor(Math.random() * 50000);
          const stock = Math.floor(Math.random() * 100) + 10;
          
          // Create unique SKU using variant ID to avoid duplicates
          productVariants.push({
            id: variantId,
            product_id: productId,
            sku: `VAR-${variantId}`,
            price: basePrice + priceVariation,
            stock: stock,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          // Link variant with color and size
          variantOptions.push(
            { product_variant_id: variantId, product_option_value_id: color.id },
            { product_variant_id: variantId, product_option_value_id: size.id }
          );
          
          variantId++;
        });
        
        // Add image for each color variant
        productImages.push({
          product_id: productId,
          product_variant_id: variantId - 1,
          image_url: `https://images.unsplash.com/photo-${1500000000000 + productId * 1000000 + colorIdx}?w=500&h=700&fit=crop`,
          is_primary: colorIdx === 0
        });
      });
      
      // Add general product images
      productImages.push({
        product_id: productId,
        product_variant_id: null,
        image_url: `https://images.unsplash.com/photo-${1500000000000 + productId * 1000000}?w=500&h=700&fit=crop`,
        is_primary: productImages.filter(img => img.product_id === productId).length === 0
      });
    }
    
    await queryInterface.bulkInsert("product_variants", productVariants);
    await queryInterface.bulkInsert("product_variant_options", variantOptions);
    await queryInterface.bulkInsert("product_images", productImages);
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
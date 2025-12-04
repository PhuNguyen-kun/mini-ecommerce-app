"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Categories - Fixed Vietnamese names
    await queryInterface.bulkInsert("categories", [
      { name: "Áo len", slug: "ao-len", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: "Quần", slug: "quan", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: "Giày boots", slug: "giay-boots", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: "Đầm/Váy", slug: "dam-vay", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: "Giày bệt & giày cao gót", slug: "giay-bet-giay-cao-got", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: "Áo khoác", slug: "ao-khoac", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: "Túi xách", slug: "tui-xach", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: "Áo thun & áo ba lỗ", slug: "ao-thun-ao-ba-lo", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: "Áo trên", slug: "ao-tren", parent_id: null, is_active: true, created_at: new Date(), updated_at: new Date() },
    ]);

    // 2. Products with real image URLs from Unsplash
    await queryInterface.bulkInsert("products", [
      // Áo len (Sweaters) - Female
      { id: 1, category_id: 1, name: "Áo Len Cổ Lọ Nữ", slug: "ao-len-co-lo-nu", gender: "female", description: "Áo len cổ lọ ấm áp, chất liệu len cao cấp.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 2, category_id: 1, name: "Áo Cardigan Dáng Dài", slug: "ao-cardigan-dang-dai", gender: "female", description: "Áo cardigan dáng dài thanh lịch.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 3, category_id: 1, name: "Áo Len Oversized", slug: "ao-len-oversized", gender: "female", description: "Áo len form rộng phong cách Hàn Quốc.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Quần (Bottoms) - Female
      { id: 4, category_id: 2, name: "Quần Jean Nữ Skinny", slug: "quan-jean-nu-skinny", gender: "female", description: "Quần jean nữ skinny ôm dáng hoàn hảo.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 5, category_id: 2, name: "Quần Tây Nữ Công Sở", slug: "quan-tay-nu-cong-so", gender: "female", description: "Quần tây nữ thanh lịch cho công sở.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 6, category_id: 2, name: "Quần Ống Rộng Vintage", slug: "quan-ong-rong-vintage", gender: "female", description: "Quần ống rộng phong cách vintage cá tính.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Giày boots - Female
      { id: 7, category_id: 3, name: "Boots Da Cao Cổ", slug: "boots-da-cao-co", gender: "female", description: "Boots da cao cổ phong cách mạnh mẽ.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 8, category_id: 3, name: "Boots Chelsea Nữ", slug: "boots-chelsea-nu", gender: "female", description: "Boots Chelsea thanh lịch dễ phối đồ.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Đầm/Váy - Female
      { id: 9, category_id: 4, name: "Váy Midi Hoa Nhí", slug: "vay-midi-hoa-nhi", gender: "female", description: "Váy midi họa tiết hoa nhí nữ tính.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 10, category_id: 4, name: "Đầm Suông Tay Dài", slug: "dam-suong-tay-dai", gender: "female", description: "Đầm suông tay dài thanh lịch.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Giày bệt & cao gót - Female
      { id: 11, category_id: 5, name: "Giày Cao Gót Mũi Nhọn", slug: "giay-cao-got-mui-nhon", gender: "female", description: "Giày cao gót mũi nhọn sang trọng.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 12, category_id: 5, name: "Giày Bệt Ballet", slug: "giay-bet-ballet", gender: "female", description: "Giày bệt ballet êm ái thoải mái.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Áo khoác - Female
      { id: 13, category_id: 6, name: "Áo Khoác Blazer", slug: "ao-khoac-blazer", gender: "female", description: "Áo khoác blazer công sở thanh lịch.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 14, category_id: 6, name: "Áo Khoác Dù", slug: "ao-khoac-du", gender: "female", description: "Áo khoác dù nhẹ chống nắng chống gió.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Túi xách - Female
      { id: 15, category_id: 7, name: "Túi Xách Tote Canvas", slug: "tui-xach-tote-canvas", gender: "female", description: "Túi xách tote canvas tiện dụng.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Áo thun & áo ba lỗ - Female
      { id: 16, category_id: 8, name: "Áo Thun Basic Nữ", slug: "ao-thun-basic-nu", gender: "female", description: "Áo thun basic cotton mềm mại.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Áo trên - Female
      { id: 17, category_id: 9, name: "Áo Kiểu Nữ Công Sở", slug: "ao-kieu-nu-cong-so", gender: "female", description: "Áo kiểu nữ sang trọng cho công sở.", is_active: true, created_at: new Date(), updated_at: new Date() },

      // Men's Products
      // Áo len
      { id: 18, category_id: 1, name: "Áo Len Nam Cổ Tròn", slug: "ao-len-nam-co-tron", gender: "male", description: "Áo len nam cổ tròn ấm áp.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 19, category_id: 1, name: "Áo Len Nam V-Neck", slug: "ao-len-nam-v-neck", gender: "male", description: "Áo len nam cổ V thanh lịch.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 20, category_id: 1, name: "Áo Cardigan Nam", slug: "ao-cardigan-nam", gender: "male", description: "Áo cardigan nam phong cách hiện đại.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 21, category_id: 1, name: "Áo Len Cổ Lọ Nam", slug: "ao-len-co-lo-nam", gender: "male", description: "Áo len cổ lọ nam ấm áp mùa đông.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Quần
      { id: 22, category_id: 2, name: "Quần Jean Nam Slim", slug: "quan-jean-nam-slim", gender: "male", description: "Quần jean nam slim fit co giãn.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 23, category_id: 2, name: "Quần Kaki Nam", slug: "quan-kaki-nam", gender: "male", description: "Quần kaki nam công sở lịch sự.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 24, category_id: 2, name: "Quần Tây Nam", slug: "quan-tay-nam", gender: "male", description: "Quần tây nam cao cấp.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Giày boots
      { id: 25, category_id: 3, name: "Boots Da Nam", slug: "boots-da-nam", gender: "male", description: "Boots da nam phong cách mạnh mẽ.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 26, category_id: 3, name: "Boots Chelsea Nam", slug: "boots-chelsea-nam", gender: "male", description: "Boots Chelsea nam thanh lịch.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Áo khoác
      { id: 27, category_id: 6, name: "Áo Khoác Hoodie Nam", slug: "ao-khoac-hoodie-nam", gender: "male", description: "Áo khoác hoodie nam streetwear.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Túi xách
      { id: 28, category_id: 7, name: "Túi Đeo Chéo Nam", slug: "tui-deo-cheo-nam", gender: "male", description: "Túi đeo chéo nam tiện dụng.", is_active: true, created_at: new Date(), updated_at: new Date() },
      
      // Áo thun
      { id: 29, category_id: 8, name: "Áo Thun Nam Basic", slug: "ao-thun-nam-basic", gender: "male", description: "Áo thun nam cotton cao cấp.", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 30, category_id: 8, name: "Áo Ba Lỗ Nam", slug: "ao-ba-lo-nam", gender: "male", description: "Áo ba lỗ nam thoáng mát.", is_active: true, created_at: new Date(), updated_at: new Date() },
    ]);

    // 3. Product Images with real URLs from Unsplash (fashion photography)
    await queryInterface.bulkInsert("product_images", [
      // Áo len nữ
      { product_id: 1, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", is_primary: true },
      { product_id: 1, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800", is_primary: false },
      
      { product_id: 2, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800", is_primary: true },
      { product_id: 2, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800", is_primary: false },
      
      { product_id: 3, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800", is_primary: true },
      { product_id: 3, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800", is_primary: false },
      
      // Quần nữ
      { product_id: 4, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800", is_primary: true },
      { product_id: 4, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800", is_primary: false },
      
      { product_id: 5, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800", is_primary: true },
      { product_id: 5, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800", is_primary: false },
      
      { product_id: 6, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800", is_primary: true },
      { product_id: 6, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1520367691844-86a5d8777ac4?w=800", is_primary: false },
      
      // Boots nữ
      { product_id: 7, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800", is_primary: true },
      { product_id: 7, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800", is_primary: false },
      
      { product_id: 8, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=800", is_primary: true },
      { product_id: 8, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800", is_primary: false },
      
      // Váy/Đầm
      { product_id: 9, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800", is_primary: true },
      { product_id: 9, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800", is_primary: false },
      
      { product_id: 10, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800", is_primary: true },
      { product_id: 10, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800", is_primary: false },
      
      // Giày cao gót & bệt
      { product_id: 11, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800", is_primary: true },
      { product_id: 11, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800", is_primary: false },
      
      { product_id: 12, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800", is_primary: true },
      { product_id: 12, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800", is_primary: false },
      
      // Áo khoác nữ
      { product_id: 13, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800", is_primary: true },
      { product_id: 13, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1558769132-cb1aea3c862a?w=800", is_primary: false },
      
      { product_id: 14, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", is_primary: true },
      { product_id: 14, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800", is_primary: false },
      
      // Túi xách
      { product_id: 15, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800", is_primary: true },
      { product_id: 15, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800", is_primary: false },
      
      // Áo thun nữ
      { product_id: 16, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", is_primary: true },
      { product_id: 16, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800", is_primary: false },
      
      // Áo kiểu
      { product_id: 17, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800", is_primary: true },
      { product_id: 17, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800", is_primary: false },
      
      // Men's products
      { product_id: 18, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", is_primary: true },
      { product_id: 19, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800", is_primary: true },
      { product_id: 20, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800", is_primary: true },
      { product_id: 21, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800", is_primary: true },
      { product_id: 22, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800", is_primary: true },
      { product_id: 23, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800", is_primary: true },
      { product_id: 24, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800", is_primary: true },
      { product_id: 25, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1542840410-3092f99611a3?w=800", is_primary: true },
      { product_id: 26, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800", is_primary: true },
      { product_id: 27, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800", is_primary: true },
      { product_id: 28, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800", is_primary: true },
      { product_id: 29, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", is_primary: true },
      { product_id: 30, product_variant_id: null, image_url: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800", is_primary: true },
    ]);

    // 4. Product Options (Color & Size for all products)
    const productOptions = [];
    for (let i = 1; i <= 30; i++) {
      productOptions.push(
        { id: i * 2 - 1, product_id: i, name: "Màu sắc" },
        { id: i * 2, product_id: i, name: "Kích cỡ" }
      );
    }
    await queryInterface.bulkInsert("product_options", productOptions);

    // 5. Product Option Values
    let optionValueId = 1;
    const productOptionValues = [];
    
    const colors = ["Đen", "Trắng", "Xanh Navy", "Xám", "Đỏ"];
    const sizes = ["S", "M", "L", "XL", "XXL"];
    
    for (let productId = 1; productId <= 30; productId++) {
      const colorOptionId = productId * 2 - 1;
      const sizeOptionId = productId * 2;
      
      // Add 5 colors per product
      colors.forEach(color => {
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

    // 6. Product Variants (25 variants per product: 5 colors x 5 sizes)
    let variantId = 1;
    const productVariants = [];
    const variantOptions = [];
    
    for (let productId = 1; productId <= 30; productId++) {
      const colorOptionId = productId * 2 - 1;
      const sizeOptionId = productId * 2;
      
      const productColors = productOptionValues.filter(v => v.product_option_id === colorOptionId);
      const productSizes = productOptionValues.filter(v => v.product_option_id === sizeOptionId);
      
      // Fixed price per product (all variants of same product have same price)
      const productPrice = 150000 + (productId * 5000);
      
      productColors.forEach(color => {
        productSizes.forEach(size => {
          // Random stock for each variant
          const stock = 10 + Math.floor(Math.random() * 90);
          
          productVariants.push({
            id: variantId,
            product_id: productId,
            sku: `VAR-${variantId}`,
            price: productPrice, // Same price for all variants
            stock: stock,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          variantOptions.push(
            { product_variant_id: variantId, product_option_value_id: color.id },
            { product_variant_id: variantId, product_option_value_id: size.id }
          );
          
          variantId++;
        });
      });
    }
    
    await queryInterface.bulkInsert("product_variants", productVariants);
    await queryInterface.bulkInsert("product_variant_options", variantOptions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_variant_options", null, {});
    await queryInterface.bulkDelete("product_variants", null, {});
    await queryInterface.bulkDelete("product_option_values", null, {});
    await queryInterface.bulkDelete("product_options", null, {});
    await queryInterface.bulkDelete("product_images", null, {});
    await queryInterface.bulkDelete("products", null, {});
    await queryInterface.bulkDelete("categories", null, {});
  }
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed reviews for multiple products with Vietnamese data
    await queryInterface.bulkInsert("product_reviews", [
      // Reviews for Product 1 (Áo Len Cổ Lọ Nữ)
      {
        id: 1,
        user_id: 1,
        product_id: 1,
        order_id: 1,
        rating: 5,
        comment: "Áo len rất đẹp và ấm áp! Chất liệu dày dặn, mặc rất thoải mái. Form dáng chuẩn, không xù lông. Rất hài lòng!",
        is_approved: true,
        created_at: new Date("2025-11-15"),
        updated_at: new Date("2025-11-15"),
      },
      {
        id: 2,
        user_id: 2,
        product_id: 1,
        order_id: null,
        rating: 4,
        comment: "Chất liệu tốt, mặc ấm. Cổ hơi chật một chút nhưng nhìn chung vẫn ok. Giá hợp lý.",
        is_approved: true,
        created_at: new Date("2025-11-18"),
        updated_at: new Date("2025-11-18"),
      },

      // Reviews for Product 2 (Áo Khoác Cardigan Len Nữ)
      {
        id: 3,
        user_id: 1,
        product_id: 2,
        order_id: null,
        rating: 5,
        comment: "Áo cardigan này quá đẹp! Vải len mềm mại, không xù. Mix đồ rất dễ. Recommend mạnh!",
        is_approved: true,
        created_at: new Date("2025-11-16"),
        updated_at: new Date("2025-11-16"),
      },

      // Reviews for Product 3 (Áo Len Dệt Kim Oversize Nữ)
      {
        id: 4,
        user_id: 2,
        product_id: 3,
        order_id: null,
        rating: 5,
        comment: "Áo oversize rất xinh! Form rộng vừa phải, không quá thùng thình. Chất len dày dặn, ấm áp. Đúng size!",
        is_approved: true,
        created_at: new Date("2025-11-17"),
        updated_at: new Date("2025-11-17"),
      },

      // Reviews for Product 4 (Áo Hoodie Nỉ Basic Nam)
      {
        id: 5,
        user_id: 1,
        product_id: 4,
        order_id: null,
        rating: 4,
        comment: "Áo hoodie chất lượng tốt trong tầm giá. Vải nỉ dày, ấm. Mũ hơi nhỏ một tý. Nhìn chung ok.",
        is_approved: true,
        created_at: new Date("2025-11-19"),
        updated_at: new Date("2025-11-19"),
      },

      // Reviews for Product 5 (Quần Jeans Skinny Nữ)
      {
        id: 6,
        user_id: 2,
        product_id: 5,
        order_id: null,
        rating: 5,
        comment: "Quần jeans đẹp lắm! Vải jean dày dặn, co giãn tốt. Ôm body vừa vặn, không bị chật. Sẽ mua thêm!",
        is_approved: true,
        created_at: new Date("2025-11-20"),
        updated_at: new Date("2025-11-20"),
      },

      // Reviews for Product 6 (Quần Tây Ống Rộng Nữ)
      {
        id: 7,
        user_id: 1,
        product_id: 6,
        order_id: null,
        rating: 5,
        comment: "Quần tây sang trọng! Vải dày, không nhăn. Ống rộng đúng trend, mặc đi làm rất phù hợp. Chuẩn size!",
        is_approved: true,
        created_at: new Date("2025-11-21"),
        updated_at: new Date("2025-11-21"),
      },

      // Reviews for Product 7 (Giày Boots Da Cổ Ngắn Nữ)
      {
        id: 8,
        user_id: 2,
        product_id: 7,
        order_id: null,
        rating: 4,
        comment: "Giày đẹp, chất da tốt. Đế hơi cứng, cần đi mềm vài lần. Gót vừa phải, đi cả ngày không mỏi.",
        is_approved: true,
        created_at: new Date("2025-11-22"),
        updated_at: new Date("2025-11-22"),
      },

      // Reviews for Product 8 (Đầm Suông Tay Dài Nữ)
      {
        id: 9,
        user_id: 1,
        product_id: 8,
        order_id: null,
        rating: 5,
        comment: "Đầm xinh quá! Vải mềm mại, mặc thoải mái. Form suông che khuyết điểm tốt. Giá hợp lý!",
        is_approved: true,
        created_at: new Date("2025-11-23"),
        updated_at: new Date("2025-11-23"),
      },

      // Reviews for Product 9 (Áo Thun Form Rộng Nam)
      {
        id: 10,
        user_id: 2,
        product_id: 9,
        order_id: null,
        rating: 5,
        comment: "Áo thun chất cotton 100% rất mát. Form rộng thoải mái. In hình đẹp, không bị phai. Đáng mua!",
        is_approved: true,
        created_at: new Date("2025-11-24"),
        updated_at: new Date("2025-11-24"),
      },

      // Reviews for Product 10 (Quần Short Kaki Nam)
      {
        id: 11,
        user_id: 1,
        product_id: 10,
        order_id: null,
        rating: 4,
        comment: "Quần short kaki dày dặn. Túi sâu, tiện dụng. Màu hơi tối hơn ảnh một chút. Vẫn ok!",
        is_approved: true,
        created_at: new Date("2025-11-25"),
        updated_at: new Date("2025-11-25"),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_reviews", null, {});
  },
};

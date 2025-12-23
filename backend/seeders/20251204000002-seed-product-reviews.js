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
      


    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_reviews", null, {});
  },
};

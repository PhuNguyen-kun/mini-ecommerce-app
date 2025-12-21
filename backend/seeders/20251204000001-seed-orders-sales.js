"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Query IDs từ database thay vì hardcode
    // Tìm Hà Nội (có thể là "Thành phố Hà Nội" hoặc "Hà Nội")
    const [provinces] = await queryInterface.sequelize.query(
      "SELECT id FROM provinces WHERE name LIKE '%Hà Nội%' LIMIT 1"
    );
    const provinceId = provinces[0]?.id || 1;

    // Tìm Quận Ba Đình trong Hà Nội
    const [districts] = await queryInterface.sequelize.query(
      "SELECT id FROM districts WHERE name LIKE '%Ba Đình%' AND province_id = ? LIMIT 1",
      { replacements: [provinceId] }
    );
    const districtId = districts[0]?.id || 1;

    // Tìm Phường Kim Mã trong Quận Ba Đình
    const [wards] = await queryInterface.sequelize.query(
      "SELECT id FROM wards WHERE name LIKE '%Kim Mã%' AND district_id = ? LIMIT 1",
      { replacements: [districtId] }
    );
    const wardId = wards[0]?.id || 1;

    // 1. User Address (Giả sử User ID 1 là Customer đã tạo ở seeder user cũ)
    await queryInterface.bulkInsert("user_addresses", [
      {
        id: 1,
        user_id: 1, // Customer
        receiver_name: "Nguyễn Văn Mua",
        phone: "0909123456",
        address_line: "Số 10 Ngõ 5",
        province_id: provinceId,
        district_id: districtId,
        ward_id: wardId,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 2. Order (Đơn hàng thành công)
    await queryInterface.bulkInsert("orders", [
      {
        id: 1,
        user_id: 1,
        order_code: "ORD-2025-001",
        status: "COMPLETED",
        // Snapshot Address
        shipping_full_name: "Nguyễn Văn Mua",
        shipping_phone: "0909123456",
        shipping_address_line: "Số 10 Ngõ 5",
        shipping_province: "Hà Nội",
        shipping_district: "Quận Ba Đình",
        shipping_ward: "Phường Kim Mã",
        // Money
        items_total: 311342, // Mua 2 cái
        shipping_fee: 30000,
        total_amount: 341342,
        payment_method: "COD",
        payment_status: "SUCCESS",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 3. Order Items (Mua 2 cái Áo Len Cổ Lọ Nữ - Variant ID 1: Đen + M)
    await queryInterface.bulkInsert("order_items", [
      {
        id: 1,
        order_id: 1,
        product_variant_id: 1, // Áo Len Cổ Lọ Nữ - Đen - M
        // Snapshot Product
        product_name_snapshot: "Áo Len Cổ Lọ Nữ",
        product_variant_description_snapshot: "Màu sắc: Đen, Kích cỡ: M",
        product_sku_snapshot: "VAR-1",
        unit_price: 155671,
        quantity: 2,
        subtotal: 311342,
      },
    ]);

    // 4. Cart (Giỏ hàng đang có 1 món chưa mua)
    await queryInterface.bulkInsert("carts", [
      { id: 1, user_id: 1, created_at: new Date(), updated_at: new Date() },
    ]);

    // 5. Cart Item (Đang thêm Quần Jeans Skinny - Variant ID 26: Đen + M)
    await queryInterface.bulkInsert("cart_items", [
      {
        id: 1,
        cart_id: 1,
        product_variant_id: 26,
        quantity: 1,
        unit_price: 167123,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("cart_items", null, {});
    await queryInterface.bulkDelete("carts", null, {});
    await queryInterface.bulkDelete("order_items", null, {});
    await queryInterface.bulkDelete("orders", null, {});
    await queryInterface.bulkDelete("user_addresses", null, {});
  },
};

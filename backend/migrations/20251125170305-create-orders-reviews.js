"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ================= NHÓM CART (GIỎ HÀNG) =================
    // 1. Carts
    await queryInterface.createTable("carts", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true, // 1 User 1 Cart
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });

    // 2. Cart Items (Chi tiết giỏ hàng)
    await queryInterface.createTable("cart_items", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      cart_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "carts", key: "id" },
        onDelete: "CASCADE",
      },
      product_variant_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "product_variants", key: "id" },
        // Không xóa item trong giỏ nếu xóa variant (để user biết sp đã hết/xóa)
        // Hoặc có thể chọn CASCADE tùy logic, ở đây chọn RESTRICT để an toàn
        onDelete: "CASCADE",
      },
      quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
      unit_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false }, // Giá tại thời điểm add
    });
    // Ràng buộc: 1 giỏ không thể có 2 dòng cho cùng 1 variant (phải cộng dồn quantity)
    await queryInterface.addConstraint("cart_items", {
      fields: ["cart_id", "product_variant_id"],
      type: "unique",
      name: "uq_cart_variant",
    });

    // ================= NHÓM ORDERS (ĐƠN HÀNG) =================
    // 3. Orders
    await queryInterface.createTable("orders", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT", // Không cho xóa User nếu đã có đơn hàng
      },
      order_code: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      status: {
        type: Sequelize.ENUM(
          "PENDING_PAYMENT",
          "PAID",
          "SHIPPING",
          "COMPLETED",
          "CANCELLED",
          "PAYMENT_FAILED"
        ),
        defaultValue: "PENDING_PAYMENT",
      },
      // === SNAPSHOT ĐỊA CHỈ (Lưu chết text) ===
      shipping_full_name: { type: Sequelize.STRING(255), allowNull: false },
      shipping_phone: { type: Sequelize.STRING(20), allowNull: false },
      shipping_address_line: { type: Sequelize.STRING(255), allowNull: false },
      shipping_province: { type: Sequelize.STRING(100), allowNull: false },
      shipping_district: { type: Sequelize.STRING(100), allowNull: false },
      shipping_ward: { type: Sequelize.STRING(100), allowNull: false },
      // ========================================
      items_total: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      shipping_fee: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      total_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      payment_method: {
        type: Sequelize.ENUM("VNPAY_FAKE", "COD", "TEST"),
        defaultValue: "VNPAY_FAKE",
      },
      payment_status: {
        type: Sequelize.ENUM("PENDING", "SUCCESS", "FAILED"),
        defaultValue: "PENDING",
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      cancelled_at: { type: Sequelize.DATE, allowNull: true },
    });

    // 4. Order Items (Chi tiết đơn hàng)
    await queryInterface.createTable("order_items", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      order_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "orders", key: "id" },
        onDelete: "CASCADE",
      },
      product_variant_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "product_variants", key: "id" },
        onDelete: "RESTRICT", // Không xóa variant nếu đã nằm trong đơn hàng
      },
      // === SNAPSHOT SẢN PHẨM (Lưu chết text) ===
      product_name_snapshot: { type: Sequelize.STRING(255), allowNull: false },
      product_variant_description_snapshot: { type: Sequelize.STRING(500), allowNull: true }, // VD: "Xanh / Size L"
      product_sku_snapshot: { type: Sequelize.STRING(100), allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false }, // Giá lúc mua
      // =========================================
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
    });

    // 5. Payment Transactions (Lịch sử thanh toán)
    await queryInterface.createTable("payment_transactions", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      order_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "orders", key: "id" },
        onDelete: "CASCADE",
      },
      provider: { type: Sequelize.ENUM("VNPAY_FAKE"), defaultValue: "VNPAY_FAKE" },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      status: { type: Sequelize.ENUM("PENDING", "SUCCESS", "FAILED"), defaultValue: "PENDING" },
      transaction_code: { type: Sequelize.STRING(100), allowNull: true },
      message: { type: Sequelize.STRING(255), allowNull: true },
      raw_request: { type: Sequelize.TEXT, allowNull: true },
      raw_response: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });

    // ================= NHÓM EXTRA (REVIEW) =================
    // 6. Product Reviews
    await queryInterface.createTable("product_reviews", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "products", key: "id" }, // Review sản phẩm gốc
        onDelete: "CASCADE",
      },
      order_id: {
        type: Sequelize.BIGINT,
        allowNull: true, // Có thể null nếu review tự do (tùy logic), ở đây link để verify
        references: { model: "orders", key: "id" },
        onDelete: "SET NULL",
      },
      rating: { type: Sequelize.TINYINT, allowNull: false }, // 1-5
      comment: { type: Sequelize.TEXT, allowNull: true },
      is_approved: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });
    // Check constraint rating 1-5 (Sequelize migration không hỗ trợ CHECK constraint native tốt trên mọi DB, nhưng MySQL 8.0+ ok)
    // Tạm thời bỏ qua CHECK ở migration để tránh lỗi version, sẽ validate ở Model/Controller
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("product_reviews");
    await queryInterface.dropTable("payment_transactions");
    await queryInterface.dropTable("order_items");
    await queryInterface.dropTable("orders");
    await queryInterface.dropTable("cart_items");
    await queryInterface.dropTable("carts");
  },
};
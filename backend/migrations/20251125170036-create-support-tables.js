"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ================= NHÓM ĐỊA CHỈ (MASTER DATA) =================
    // 1. Provinces (Tỉnh/Thành)
    await queryInterface.createTable("provinces", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
    });

    // 2. Districts (Quận/Huyện)
    await queryInterface.createTable("districts", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      province_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "provinces", key: "id" },
        onDelete: "CASCADE",
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
    });

    // 3. Wards (Phường/Xã)
    await queryInterface.createTable("wards", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      district_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "districts", key: "id" },
        onDelete: "CASCADE",
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
    });

    // 4. User Addresses (Sổ địa chỉ của User)
    await queryInterface.createTable("user_addresses", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      receiver_name: { type: Sequelize.STRING(255), allowNull: false },
      phone: { type: Sequelize.STRING(20), allowNull: false },
      address_line: { type: Sequelize.STRING(255), allowNull: false }, // Số nhà, đường
      province_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "provinces", key: "id" },
      },
      district_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "districts", key: "id" },
      },
      ward_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "wards", key: "id" },
      },
      is_default: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    // ================= NHÓM MEDIA & EXTRA =================
    // 5. Product Images
    await queryInterface.createTable("product_images", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      product_variant_id: {
        type: Sequelize.BIGINT,
        allowNull: true, // Có thể null nếu là ảnh chung
        references: { model: "product_variants", key: "id" },
        onDelete: "SET NULL",
      },
      image_url: { type: Sequelize.STRING(500), allowNull: false },
      is_primary: { type: Sequelize.BOOLEAN, defaultValue: false },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    // 6. Product Videos
    await queryInterface.createTable("product_videos", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      video_url: { type: Sequelize.STRING(500), allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    // 7. Wishlists (Yêu thích)
    await queryInterface.createTable("wishlists", {
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
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
    // Ràng buộc: 1 User chỉ like 1 sản phẩm 1 lần
    await queryInterface.addConstraint("wishlists", {
      fields: ["user_id", "product_id"],
      type: "unique",
      name: "uq_user_product_wishlist",
    });

    // 8. Product Views (Lịch sử xem - để gợi ý)
    await queryInterface.createTable("product_views", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: true, // Khách vãng lai cũng tính view
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      viewed_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
  },

  async down(queryInterface, Sequelize) {
    // Xóa ngược thứ tự
    await queryInterface.dropTable("product_views");
    await queryInterface.dropTable("wishlists");
    await queryInterface.dropTable("product_videos");
    await queryInterface.dropTable("product_images");
    await queryInterface.dropTable("user_addresses");
    await queryInterface.dropTable("wards");
    await queryInterface.dropTable("districts");
    await queryInterface.dropTable("provinces");
  },
};
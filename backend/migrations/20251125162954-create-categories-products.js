"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Bảng Categories [cite: 55]
    await queryInterface.createTable("categories", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      parent_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "categories", // Tự tham chiếu chính nó
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // [cite: 65]
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE, // Sequelize tự map sang TIMESTAMP
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // 2. Bảng Products
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // [cite: 79]
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      gender: {
        type: Sequelize.ENUM("male", "female", "unisex"),
        allowNull: false,
        defaultValue: "unisex",
      },
      // ======================================
      short_description: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Indexes cho Categories
    await queryInterface.addIndex("categories", ["deleted_at"]);
    await queryInterface.addIndex("categories", ["parent_id"]);

    // Indexes cho Products
    await queryInterface.addIndex("products", ["category_id"]); // [cite: 79]
    await queryInterface.addIndex("products", ["deleted_at"]);
    await queryInterface.addIndex("products", ["gender"]); // Index cho cột mới để lọc nhanh hơn
  },

  async down(queryInterface, Sequelize) {
    // Xóa theo thứ tự ngược lại: Con trước -> Cha sau
    await queryInterface.dropTable("products");
    await queryInterface.dropTable("categories");
  },
};
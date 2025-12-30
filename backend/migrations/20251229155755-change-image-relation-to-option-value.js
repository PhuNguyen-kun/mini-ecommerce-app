"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        // 1. Xóa cột cũ (product_variant_id)
        queryInterface.removeColumn("product_images", "product_variant_id", {
          transaction: t,
        }),

        // 2. Thêm cột mới (product_option_value_id)
        queryInterface.addColumn(
          "product_images",
          "product_option_value_id",
          {
            type: Sequelize.BIGINT,
            allowNull: true,
            references: {
              model: "product_option_values", // Tên bảng option values
              key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL", // Xóa option value thì ảnh vẫn còn (chỉ mất link)
          },
          { transaction: t }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        // Rollback: Xóa cột mới
        queryInterface.removeColumn("product_images", "product_option_value_id", {
          transaction: t,
        }),

        // Rollback: Thêm lại cột cũ
        queryInterface.addColumn(
          "product_images",
          "product_variant_id",
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: "product_variants",
              key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },
          { transaction: t }
        ),
      ]);
    });
  },
};
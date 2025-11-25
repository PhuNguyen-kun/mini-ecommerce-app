"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 3. Bảng product_options (Màu sắc, Kích cỡ...)
    await queryInterface.createTable("product_options", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // Xóa sản phẩm -> Xóa luôn Option
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false, // VD: "Màu sắc"
      },
    });
    // Ràng buộc: Một sản phẩm không được có 2 option cùng tên
    await queryInterface.addConstraint("product_options", {
      fields: ["product_id", "name"],
      type: "unique",
      name: "uq_product_option_name",
    });

    // 4. Bảng product_option_values (Đỏ, Xanh, S, M...)
    await queryInterface.createTable("product_option_values", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      product_option_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "product_options",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      value: {
        type: Sequelize.STRING(100),
        allowNull: false, // VD: "Xanh"
      },
      meta: {
        type: Sequelize.STRING(255),
        allowNull: true, // VD: Mã hex màu #FF0000
      },
    });
    await queryInterface.addConstraint("product_option_values", {
      fields: ["product_option_id", "value"],
      type: "unique",
      name: "uq_option_value",
    });

    // 5. Bảng product_variants (Sản phẩm BÁN - chứa Giá & Stock)
    await queryInterface.createTable("product_variants", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true, // VD: "AO-XANH-L"
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    // Index cho SKU để tìm kiếm nhanh
    await queryInterface.addIndex("product_variants", ["sku"]);
    await queryInterface.addIndex("product_variants", ["deleted_at"]);

    // 6. Bảng product_variant_options (Bảng nối: Biến thể này có những option nào)
    await queryInterface.createTable("product_variant_options", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      product_variant_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "product_variants",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      product_option_value_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "product_option_values",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
    // Đảm bảo không trùng lặp cặp (variant, value)
    await queryInterface.addConstraint("product_variant_options", {
      fields: ["product_variant_id", "product_option_value_id"],
      type: "unique",
      name: "uq_variant_option_value",
    });
  },

  async down(queryInterface, Sequelize) {
    // Xóa ngược thứ tự tạo
    await queryInterface.dropTable("product_variant_options");
    await queryInterface.dropTable("product_variants");
    await queryInterface.dropTable("product_option_values");
    await queryInterface.dropTable("product_options");
  },
};
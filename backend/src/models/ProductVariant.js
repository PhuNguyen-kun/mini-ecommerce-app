const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class ProductVariant extends Model {
        static associate(models) {
            // Thuộc về Product gốc
            ProductVariant.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });

            // Quan hệ Many-to-Many để lấy toàn bộ option values của variant (dùng để hiển thị)
            ProductVariant.belongsToMany(models.ProductOptionValue, {
                through: models.ProductVariantOption,
                foreignKey: "product_variant_id",
                otherKey: "product_option_value_id",
                as: "option_values",
            });

            /**
             * ✅ Thêm 2 alias để filter AND màu/size
             * Không đổi DB, chỉ tạo thêm association alias trỏ cùng bảng join
             */
            ProductVariant.belongsToMany(models.ProductOptionValue, {
                through: models.ProductVariantOption,
                foreignKey: "product_variant_id",
                otherKey: "product_option_value_id",
                as: "color_values",
            });

            ProductVariant.belongsToMany(models.ProductOptionValue, {
                through: models.ProductVariantOption,
                foreignKey: "product_variant_id",
                otherKey: "product_option_value_id",
                as: "size_values",
            });

            // Link tới ảnh (nếu biến thể có ảnh riêng)
            ProductVariant.hasMany(models.ProductImage, { foreignKey: "product_variant_id", as: "images" });
        }
    }

    ProductVariant.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            product_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            sku: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
            price: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
            },
            stock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            // Có timestamp và soft delete
            created_at: {
                type: DataTypes.DATE,
                field: "created_at",
            },
            updated_at: {
                type: DataTypes.DATE,
                field: "updated_at",
            },
            deleted_at: {
                type: DataTypes.DATE,
                field: "deleted_at",
            },
        },
        {
            sequelize,
            modelName: "ProductVariant",
            tableName: "product_variants",
            timestamps: true,
            paranoid: true, // Soft delete
            underscored: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            deletedAt: "deleted_at",
        }
    );

    return ProductVariant;
};
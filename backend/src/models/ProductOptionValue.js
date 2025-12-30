const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class ProductOptionValue extends Model {
        static associate(models) {
            // Thuộc về 1 Option
            ProductOptionValue.belongsTo(models.ProductOption, { foreignKey: "product_option_id", as: "option" });

            // Quan hệ Many-to-Many với Variant (thông qua bảng nối)
            // Một giá trị (VD: Đỏ) có thể thuộc nhiều biến thể (Áo Đỏ S, Áo Đỏ M)
            ProductOptionValue.belongsToMany(models.ProductVariant, {
                through: models.ProductVariantOption,
                foreignKey: "product_option_value_id",
                otherKey: "product_variant_id",
                as: "variants",
            });
            // Quan hệ 1 - N với Ảnh
            ProductOptionValue.hasMany(models.ProductImage, {
                foreignKey: "product_option_value_id",
                as: "images"
            });
        }
    }

    ProductOptionValue.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            product_option_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            value: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            meta: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "ProductOptionValue",
            tableName: "product_option_values",
            timestamps: false, // Không timestamp
            underscored: true,
        }
    );

    return ProductOptionValue;
};
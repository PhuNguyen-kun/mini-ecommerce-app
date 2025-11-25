const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class ProductVariantOption extends Model {
        static associate(models) {
            // Bảng trung gian thường ít khi cần gọi associate ngược lại, 
            // nhưng khai báo để rõ ràng
            ProductVariantOption.belongsTo(models.ProductVariant, { foreignKey: "product_variant_id" });
            ProductVariantOption.belongsTo(models.ProductOptionValue, { foreignKey: "product_option_value_id" });
        }
    }

    ProductVariantOption.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            product_variant_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            product_option_value_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "ProductVariantOption",
            tableName: "product_variant_options",
            timestamps: false, // Không timestamp
            underscored: true,
        }
    );

    return ProductVariantOption;
};
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class ProductOption extends Model {
        static associate(models) {
            // 1 Option thuộc về 1 Product
            ProductOption.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });

            // 1 Option có nhiều giá trị (VD: Màu sắc -> Xanh, Đỏ)
            ProductOption.hasMany(models.ProductOptionValue, { foreignKey: "product_option_id", as: "values" });
        }
    }

    ProductOption.init(
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
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "ProductOption",
            tableName: "product_options",
            timestamps: false, // Bảng này không có created_at/updated_at
            underscored: true,
        }
    );

    return ProductOption;
};
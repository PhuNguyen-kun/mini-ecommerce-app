const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class ProductView extends Model {
        static associate(models) {
            ProductView.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
            ProductView.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
        }
    }

    ProductView.init({
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.BIGINT, allowNull: true },
        product_id: { type: DataTypes.BIGINT, allowNull: false },
        viewed_at: { type: DataTypes.DATE, field: "viewed_at", defaultValue: DataTypes.NOW },
    }, {
        sequelize,
        modelName: "ProductView",
        tableName: "product_views",
        timestamps: true,
        createdAt: "viewed_at", // Map created_at thành viewed_at
        updatedAt: false,
        underscored: true,
    });
    return ProductView;
};
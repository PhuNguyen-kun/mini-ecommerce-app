const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class CartItem extends Model {
        static associate(models) {
            CartItem.belongsTo(models.Cart, { foreignKey: "cart_id", as: "cart" });
            CartItem.belongsTo(models.ProductVariant, { foreignKey: "product_variant_id", as: "variant" });
        }
    }

    CartItem.init({
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        cart_id: { type: DataTypes.BIGINT, allowNull: false },
        product_variant_id: { type: DataTypes.BIGINT, allowNull: false },
        quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
        unit_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    }, {
        sequelize,
        modelName: "CartItem",
        tableName: "cart_items",
        timestamps: false, // Bảng chi tiết thường không cần timestamp
        underscored: true,
    });
    return CartItem;
};
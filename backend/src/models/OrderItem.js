const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class OrderItem extends Model {
        static associate(models) {
            OrderItem.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
            OrderItem.belongsTo(models.ProductVariant, { foreignKey: "product_variant_id", as: "variant" });
        }
    }

    OrderItem.init({
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        order_id: { type: DataTypes.BIGINT, allowNull: false },
        product_variant_id: { type: DataTypes.BIGINT, allowNull: false },
        // Snapshot Product Info
        product_name_snapshot: { type: DataTypes.STRING(255), allowNull: false },
        product_variant_description_snapshot: { type: DataTypes.STRING(500), allowNull: true },
        product_sku_snapshot: { type: DataTypes.STRING(100), allowNull: false },
        unit_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        // Calc
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    }, {
        sequelize,
        modelName: "OrderItem",
        tableName: "order_items",
        timestamps: false,
        underscored: true,
    });
    return OrderItem;
};
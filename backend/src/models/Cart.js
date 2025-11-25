const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class Cart extends Model {
        static associate(models) {
            Cart.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
            Cart.hasMany(models.CartItem, { foreignKey: "cart_id", as: "items" });
        }
    }

    Cart.init({
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.BIGINT, allowNull: false, unique: true },
        created_at: { type: DataTypes.DATE, field: "created_at" },
        updated_at: { type: DataTypes.DATE, field: "updated_at" },
    }, {
        sequelize,
        modelName: "Cart",
        tableName: "carts",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    });
    return Cart;
};
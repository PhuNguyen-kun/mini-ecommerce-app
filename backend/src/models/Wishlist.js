const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class Wishlist extends Model {
        static associate(models) {
            Wishlist.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
            Wishlist.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
        }
    }

    Wishlist.init({
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.BIGINT, allowNull: false },
        product_id: { type: DataTypes.BIGINT, allowNull: false },
        created_at: { type: DataTypes.DATE, field: "created_at" },
    }, {
        sequelize,
        modelName: "Wishlist",
        tableName: "wishlists",
        timestamps: true,
        updatedAt: false, // Chỉ có created_at, không có updated_at
        underscored: true,
        createdAt: "created_at",
    });
    return Wishlist;
};
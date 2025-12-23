const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class ProductReview extends Model {
        static associate(models) {
            ProductReview.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
            ProductReview.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
            ProductReview.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
            ProductReview.hasMany(models.ProductVideo, { foreignKey: "review_id", as: "videos" });
        }
    }

    ProductReview.init({
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.BIGINT, allowNull: false },
        product_id: { type: DataTypes.BIGINT, allowNull: false },
        order_id: { type: DataTypes.BIGINT, allowNull: true },
        rating: { type: DataTypes.TINYINT, allowNull: false },
        comment: { type: DataTypes.TEXT, allowNull: true },
        images: { type: DataTypes.JSON, allowNull: true },
        video_url: { type: DataTypes.STRING(255), allowNull: true },
        video_public_id: { type: DataTypes.STRING(255), allowNull: true },
        is_approved: { type: DataTypes.BOOLEAN, defaultValue: true },
        created_at: { type: DataTypes.DATE, field: "created_at" },
        updated_at: { type: DataTypes.DATE, field: "updated_at" },
        deleted_at: { type: DataTypes.DATE, field: "deleted_at" },
    }, {
        sequelize,
        modelName: "ProductReview",
        tableName: "product_reviews",
        timestamps: true,
        paranoid: true, // Soft Delete
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    });
    return ProductReview;
};
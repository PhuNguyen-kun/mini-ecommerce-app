const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class ProductVideo extends Model {
        static associate(models) {
            ProductVideo.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
        }
    }

    ProductVideo.init({
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        product_id: { type: DataTypes.BIGINT, allowNull: false },
        video_url: { type: DataTypes.STRING(500), allowNull: false },
        public_id: { type: DataTypes.STRING(255), allowNull: true }, // Lưu ID của Cloudinary 
        deleted_at: { type: DataTypes.DATE, field: "deleted_at" },
    }, {
        sequelize,
        modelName: "ProductVideo",
        tableName: "product_videos",
        timestamps: false,
        paranoid: true, // Soft Delete
        underscored: true,
        deletedAt: "deleted_at",
    });
    return ProductVideo;
};
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class ProductImage extends Model {
        static associate(models) {
            ProductImage.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
            ProductImage.belongsTo(models.ProductVariant, { foreignKey: "product_variant_id", as: "variant" });
        }
    }

    ProductImage.init({
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        product_id: { type: DataTypes.BIGINT, allowNull: false },
        product_variant_id: { type: DataTypes.BIGINT, allowNull: true },
        image_url: { type: DataTypes.STRING(500), allowNull: false },
        public_id: { type: DataTypes.STRING(255), allowNull: true }, // Lưu ID của Cloudinary 
        is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
        sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
        deleted_at: { type: DataTypes.DATE, field: "deleted_at" },
    }, {
        sequelize,
        modelName: "ProductImage",
        tableName: "product_images",
        timestamps: false, // Bảng này không có created_at/updated_at
        paranoid: true, // Nhưng có deleted_at (Soft Delete)
        underscored: true,
        deletedAt: "deleted_at",
    });
    return ProductImage;
};
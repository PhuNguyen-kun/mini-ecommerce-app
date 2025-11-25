const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class Product extends Model {
        static associate(models) {
            // Link tới Category
            Product.belongsTo(models.Category, { foreignKey: "category_id", as: "category" });

            // Link tới các bảng con (Sẽ tạo sau)
            // Product.hasMany(models.ProductOption, ...);
            // Product.hasMany(models.ProductVariant, ...);
            // Product.hasMany(models.ProductImage, ...);
        }
    }

    Product.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            category_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            // Gender mà bạn mới thêm
            gender: {
                type: DataTypes.ENUM("male", "female", "unisex"),
                allowNull: false,
                defaultValue: "unisex",
            },
            short_description: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            created_at: {
                type: DataTypes.DATE,
                field: "created_at",
            },
            updated_at: {
                type: DataTypes.DATE,
                field: "updated_at",
            },
            deleted_at: {
                type: DataTypes.DATE,
                field: "deleted_at",
            },
        },
        {
            sequelize,
            modelName: "Product",
            tableName: "products",
            timestamps: true,
            paranoid: true,
            underscored: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            deletedAt: "deleted_at",
        }
    );

    return Product;
};
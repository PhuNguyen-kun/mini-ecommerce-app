const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class Category extends Model {
        static associate(models) {
            // Tự liên kết (Cha - Con)
            Category.hasMany(models.Category, { foreignKey: "parent_id", as: "children" });
            Category.belongsTo(models.Category, { foreignKey: "parent_id", as: "parent" });

            // Liên kết với Product
            Category.hasMany(models.Product, { foreignKey: "category_id", as: "products" });
        }
    }

    Category.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
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
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            parent_id: {
                type: DataTypes.BIGINT,
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
            modelName: "Category",
            tableName: "categories",
            timestamps: true,
            paranoid: true, // Soft delete
            underscored: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            deletedAt: "deleted_at",
        }
    );

    return Category;
};
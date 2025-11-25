const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class UserAddress extends Model {
        static associate(models) {
            // Thuộc về User
            UserAddress.belongsTo(models.User, { foreignKey: "user_id", as: "user" });

            // Link tới 3 bảng địa chính để lấy tên hiển thị
            UserAddress.belongsTo(models.Province, { foreignKey: "province_id", as: "province" });
            UserAddress.belongsTo(models.District, { foreignKey: "district_id", as: "district" });
            UserAddress.belongsTo(models.Ward, { foreignKey: "ward_id", as: "ward" });
        }
    }

    UserAddress.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            receiver_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            address_line: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            province_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            district_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ward_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            is_default: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            // Các trường timestamp và soft delete
            created_at: { type: DataTypes.DATE, field: "created_at" },
            updated_at: { type: DataTypes.DATE, field: "updated_at" },
            deleted_at: { type: DataTypes.DATE, field: "deleted_at" },
        },
        {
            sequelize,
            modelName: "UserAddress",
            tableName: "user_addresses",
            timestamps: true,
            paranoid: true, // Soft delete
            underscored: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            deletedAt: "deleted_at",
        }
    );

    return UserAddress;
};
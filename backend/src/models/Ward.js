const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class Ward extends Model {
        static associate(models) {
            // Thuộc về Quận
            Ward.belongsTo(models.District, { foreignKey: "district_id", as: "district" });
            // Có nhiều địa chỉ giao hàng
            Ward.hasMany(models.UserAddress, { foreignKey: "ward_id", as: "addresses" });
        }
    }

    Ward.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            district_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Ward",
            tableName: "wards",
            timestamps: false, // Không timestamp
            underscored: true,
        }
    );

    return Ward;
};
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class District extends Model {
        static associate(models) {
            // Thuộc về Tỉnh
            District.belongsTo(models.Province, { foreignKey: "province_id", as: "province" });
            // Có nhiều Phường/Xã
            District.hasMany(models.Ward, { foreignKey: "district_id", as: "wards" });
            // Có nhiều địa chỉ giao hàng
            District.hasMany(models.UserAddress, { foreignKey: "district_id", as: "addresses" });
        }
    }

    District.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            province_id: {
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
            modelName: "District",
            tableName: "districts",
            timestamps: false, // Không timestamp
            underscored: true,
        }
    );

    return District;
};
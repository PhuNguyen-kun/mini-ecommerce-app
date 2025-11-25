const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class Province extends Model {
        static associate(models) {
            // 1 Tỉnh có nhiều Quận/Huyện
            Province.hasMany(models.District, { foreignKey: "province_id", as: "districts" });
            // 1 Tỉnh có thể nằm trong nhiều địa chỉ giao hàng
            Province.hasMany(models.UserAddress, { foreignKey: "province_id", as: "addresses" });
        }
    }

    Province.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
        },
        {
            sequelize,
            modelName: "Province",
            tableName: "provinces",
            timestamps: false, // Bảng này không có created_at/updated_at
            underscored: true,
        }
    );

    return Province;
};
const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // 1. User có 1 Giỏ hàng
      User.hasOne(models.Cart, { foreignKey: "user_id", as: "cart" });

      // 2. User có nhiều Địa chỉ
      User.hasMany(models.UserAddress, { foreignKey: "user_id", as: "addresses" });

      // 3. User có nhiều sản phẩm yêu thích
      User.hasMany(models.Wishlist, { foreignKey: "user_id", as: "wishlist" });

      // 4. User có nhiều Đơn hàng
      User.hasMany(models.Order, { foreignKey: "user_id", as: "orders" });

      // 5. User viết nhiều Đánh giá
      User.hasMany(models.ProductReview, { foreignKey: "user_id", as: "reviews" });

      // 6. User xem nhiều sản phẩm (Lịch sử xem)
      User.hasMany(models.ProductView, { foreignKey: "user_id", as: "viewed_products" });
    }
    async comparePassword(password) {
      return bcrypt.compare(password, this.password_hash);
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password_hash;
      delete values.deleted_at;
      return values;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      full_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("customer", "admin"),
        allowNull: false,
        defaultValue: "customer",
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "updated_at",
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "deleted_at",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      underscored: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      hooks: {
        beforeCreate: async (user) => {
          if (user.password_hash) {
            user.password_hash = await bcrypt.hash(user.password_hash, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password_hash")) {
            user.password_hash = await bcrypt.hash(user.password_hash, 10);
          }
        },
      },
    }
  );

  return User;
};

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
      Order.hasMany(models.OrderItem, { foreignKey: "order_id", as: "items" });
      Order.hasMany(models.PaymentTransaction, {
        foreignKey: "order_id",
        as: "transactions",
      });
      Order.hasMany(models.ProductReview, {
        foreignKey: "order_id",
        as: "reviews",
      });
    }
  }

  Order.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT, allowNull: false },
      order_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM(
          "PENDING_PAYMENT",
          "CONFIRMED",
          "PAID",
          "SHIPPING",
          "COMPLETED",
          "CANCELLED",
          "PAYMENT_FAILED"
        ),
        defaultValue: "PENDING_PAYMENT",
      },
      // Snapshot Address
      shipping_full_name: { type: DataTypes.STRING(255), allowNull: false },
      shipping_phone: { type: DataTypes.STRING(20), allowNull: false },
      shipping_address_line: { type: DataTypes.STRING(255), allowNull: false },
      shipping_province: { type: DataTypes.STRING(100), allowNull: false },
      shipping_district: { type: DataTypes.STRING(100), allowNull: false },
      shipping_ward: { type: DataTypes.STRING(100), allowNull: false },
      // Money
      items_total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      shipping_fee: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      // Payment
      payment_method: {
        type: DataTypes.ENUM("VNPAY_FAKE", "COD", "TEST"),
        defaultValue: "VNPAY_FAKE",
      },
      payment_status: {
        type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
        defaultValue: "PENDING",
      },
      // Dates
      paid_at: { type: DataTypes.DATE, allowNull: true },
      cancelled_at: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, field: "created_at" },
      updated_at: { type: DataTypes.DATE, field: "updated_at" },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Order;
};

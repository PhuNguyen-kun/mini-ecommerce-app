const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class PaymentTransaction extends Model {
    static associate(models) {
      PaymentTransaction.belongsTo(models.Order, {
        foreignKey: "order_id",
        as: "order",
      });
    }
  }

  PaymentTransaction.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      order_id: { type: DataTypes.BIGINT, allowNull: false },
      provider: {
        type: DataTypes.ENUM("VNPAY_FAKE"),
        defaultValue: "VNPAY_FAKE",
      },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      status: {
        type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
        defaultValue: "PENDING",
      },
      transaction_code: { type: DataTypes.STRING(100), allowNull: true },
      message: { type: DataTypes.STRING(255), allowNull: true },
      raw_request: { type: DataTypes.TEXT, allowNull: true },
      raw_response: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, field: "created_at" },
      updated_at: { type: DataTypes.DATE, field: "updated_at" },
    },
    {
      sequelize,
      modelName: "PaymentTransaction",
      tableName: "payment_transactions",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return PaymentTransaction;
};

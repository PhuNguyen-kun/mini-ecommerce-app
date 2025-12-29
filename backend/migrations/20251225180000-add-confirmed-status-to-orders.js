'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm CONFIRMED vào ENUM status của orders table
    await queryInterface.sequelize.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM(
        'PENDING_PAYMENT',
        'CONFIRMED',
        'PAID',
        'SHIPPING',
        'COMPLETED',
        'CANCELLED',
        'PAYMENT_FAILED'
      ) NOT NULL DEFAULT 'PENDING_PAYMENT'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert về ENUM cũ (không có CONFIRMED)
    // Lưu ý: Cần chuyển các đơn hàng có status CONFIRMED về PENDING_PAYMENT trước
    await queryInterface.sequelize.query(`
      UPDATE orders 
      SET status = 'PENDING_PAYMENT' 
      WHERE status = 'CONFIRMED'
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM(
        'PENDING_PAYMENT',
        'PAID',
        'SHIPPING',
        'COMPLETED',
        'CANCELLED',
        'PAYMENT_FAILED'
      ) NOT NULL DEFAULT 'PENDING_PAYMENT'
    `);
  }
};


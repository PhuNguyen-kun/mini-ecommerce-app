'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_reviews', 'images', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'comment' // Thêm sau cột comment
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('product_reviews', 'images');
  }
};

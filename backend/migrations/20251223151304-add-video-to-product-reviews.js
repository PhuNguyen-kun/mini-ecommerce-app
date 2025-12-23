'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('product_reviews', 'video_url', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'images'
    });

    await queryInterface.addColumn('product_reviews', 'video_public_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'video_url'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('product_reviews', 'video_public_id');
    await queryInterface.removeColumn('product_reviews', 'video_url');
  }
};

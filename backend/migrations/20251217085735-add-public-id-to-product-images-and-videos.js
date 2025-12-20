'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm public_id vào product_images
    await queryInterface.addColumn('product_images', 'public_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'image_url'
    });

    // Thêm public_id vào product_videos
    await queryInterface.addColumn('product_videos', 'public_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'video_url'
    });
  },

  async down(queryInterface, Sequelize) {
    // Xóa public_id khỏi product_images
    await queryInterface.removeColumn('product_images', 'public_id');

    // Xóa public_id khỏi product_videos
    await queryInterface.removeColumn('product_videos', 'public_id');
  }
};

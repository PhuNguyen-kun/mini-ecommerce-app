'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_videos', 'review_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'product_reviews',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Add index for better query performance
    await queryInterface.addIndex('product_videos', ['review_id']);
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign key constraint first
    await queryInterface.removeConstraint('product_videos', 'product_videos_review_id_foreign_idx');
    // Then remove index
    await queryInterface.removeIndex('product_videos', ['review_id']);
    // Finally remove column
    await queryInterface.removeColumn('product_videos', 'review_id');
  }
};
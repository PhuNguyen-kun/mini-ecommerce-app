"use strict";

const axios = require("axios");

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Fetch data from API
      const response = await axios.get(
        "https://provinces.open-api.vn/api/?depth=1"
      );
      const provinces = response.data;

      // Prepare data for bulk insert
      const provincesData = provinces.map((province) => ({
        name: province.name,
      }));

      // Insert provinces
      await queryInterface.bulkInsert("provinces", provincesData);
    } catch (error) {
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("provinces", null, {});
  },
};

"use strict";

const axios = require("axios");

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Fetch data from API
      const response = await axios.get(
        "https://provinces.open-api.vn/api/?depth=2"
      );
      const provinces = response.data;

      // Get all provinces from database to create mapping: province_code -> province_id
      const [provincesInDb] = await queryInterface.sequelize.query(
        "SELECT id, name FROM provinces ORDER BY id"
      );

      // Create mapping: province name -> province database id
      const provinceMap = new Map();
      provincesInDb.forEach((p) => {
        provinceMap.set(p.name, p.id);
      });

      // Prepare districts data
      const districtsData = [];

      for (const province of provinces) {
        const provinceId = provinceMap.get(province.name);

        if (!provinceId) {
          continue;
        }

        if (province.districts && province.districts.length > 0) {
          for (const district of province.districts) {
            districtsData.push({
              province_id: provinceId,
              name: district.name,
            });
          }
        }
      }

      // Insert districts in batches to avoid memory issues
      const batchSize = 500;
      for (let i = 0; i < districtsData.length; i += batchSize) {
        const batch = districtsData.slice(i, i + batchSize);
        await queryInterface.bulkInsert("districts", batch);
      }
    } catch (error) {
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("districts", null, {});
  },
};

"use strict";

const axios = require("axios");

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Fetch data from API
      const response = await axios.get(
        "https://provinces.open-api.vn/api/v1/?depth=3"
      );
      const provinces = response.data;

      // Get all districts from database to create mapping: district name -> district id
      const [districtsInDb] = await queryInterface.sequelize.query(
        "SELECT id, name, province_id FROM districts ORDER BY id"
      );

      // Create mapping: "district_name|province_name" -> district database id
      // We need province name too because district names might be duplicated across provinces
      const districtMap = new Map();

      // First, get province names
      const [provincesInDb] = await queryInterface.sequelize.query(
        "SELECT id, name FROM provinces ORDER BY id"
      );
      const provinceIdToName = new Map();
      provincesInDb.forEach((p) => {
        provinceIdToName.set(p.id, p.name);
      });

      // Create district map with province context
      districtsInDb.forEach((d) => {
        const provinceName = provinceIdToName.get(d.province_id);
        const key = `${d.name}|${provinceName}`;
        districtMap.set(key, d.id);
      });

      // Prepare wards data
      const wardsData = [];

      for (const province of provinces) {
        if (!province.districts || province.districts.length === 0) {
          continue;
        }

        for (const district of province.districts) {
          // Find district ID using province name + district name
          const districtKey = `${district.name}|${province.name}`;
          const districtId = districtMap.get(districtKey);

          if (!districtId) {
            continue;
          }

          if (district.wards && district.wards.length > 0) {
            for (const ward of district.wards) {
              wardsData.push({
                district_id: districtId,
                name: ward.name,
              });
            }
          }
        }
      }

      // Insert wards in batches to avoid memory issues
      const batchSize = 500;
      for (let i = 0; i < wardsData.length; i += batchSize) {
        const batch = wardsData.slice(i, i + batchSize);
        await queryInterface.bulkInsert("wards", batch);
      }
    } catch (error) {
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("wards", null, {});
  },
};

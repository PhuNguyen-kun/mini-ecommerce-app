"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tỉnh/Thành
    await queryInterface.bulkInsert("provinces", [
      { id: 1, name: "Hà Nội" },
      { id: 2, name: "TP. Hồ Chí Minh" },
    ]);

    // 2. Quận/Huyện
    await queryInterface.bulkInsert("districts", [
      { id: 1, province_id: 1, name: "Quận Ba Đình" },
      { id: 2, province_id: 1, name: "Quận Cầu Giấy" },
      { id: 3, province_id: 2, name: "Quận 1" },
    ]);

    // 3. Phường/Xã
    await queryInterface.bulkInsert("wards", [
      { id: 1, district_id: 1, name: "Phường Kim Mã" },
      { id: 2, district_id: 2, name: "Phường Dịch Vọng" },
      { id: 3, district_id: 3, name: "Phường Bến Nghé" },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("wards", null, {});
    await queryInterface.bulkDelete("districts", null, {});
    await queryInterface.bulkDelete("provinces", null, {});
  },
};
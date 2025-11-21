"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("12345678", 10);

    await queryInterface.bulkInsert("users", [
      {
        full_name: "Customer",
        email: "customer@gmail.com",
        password_hash: hashedPassword,
        role: "customer",
        phone: "0123456789",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        full_name: "Admin",
        email: "admin@gmail.com",
        password_hash: hashedPassword,
        role: "admin",
        phone: "0987654321",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", {
      email: ["customer@example.com", "admin@example.com"],
    });
  },
};

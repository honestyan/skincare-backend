"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //insert category
    await queryInterface.bulkInsert("Categories", [
      {
        name: "Wardah",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Kahf",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    //delete category
    await queryInterface.bulkDelete("Categories", null, {});
  },
};

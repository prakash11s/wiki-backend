'use strict';
const Constants = require('../services/Constants');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('membership',[
      {
        name: 'BROWSING',
        price: 500,
        individual_hrs: 1,
        group_pod_hrs: 1,
        terrace_hrs: 1,
        individual_price: 120,
        group_price: 120,
        terrace_price: 120,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'READERSHIP',
        price: 800,
        individual_hrs: 1,
        group_pod_hrs: 1,
        terrace_hrs: 1,
        individual_price: 120,
        group_price: 120,
        terrace_price: 120,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'STUDENTS',
        price: 1200,
        individual_hrs: 1,
        group_pod_hrs: 1,
        terrace_hrs: 1,
        individual_price: 120,
        group_price: 120,
        terrace_price: 120,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'PROFESSIONAL',
        price: 2000,
        individual_hrs: 1,
        group_pod_hrs: 1,
        terrace_hrs: 1,
        individual_price: 120,
        group_price: 120,
        terrace_price: 120,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'CORPORATE',
        price: 3000,
        individual_hrs: 1,
        group_pod_hrs: 1,
        terrace_hrs: 1,
        individual_price: 120,
        group_price: 120,
        terrace_price: 120,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('membership', null, {})
  }
};

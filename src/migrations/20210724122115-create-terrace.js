'use strict';
const Constants = require('../services/Constants')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('terrace', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      price : {
        type: Sequelize.INTEGER
      },
      location : {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: Constants.ACTIVE,
        comment: '0-inactive, 1-active, 2-deleted'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('terrace');
  }
};

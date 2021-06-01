const Constants = require('../services/Constants')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      mobile: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      otp: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      otp_expiry: {
        type: Sequelize.DATE,
        allowNull: true
      },
      qr_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      profile_image: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      verification_status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: Constants.NOT_VERIFIED,
        comment: '0-pending,1-done'
      },
      new_mobile: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: ''
      },
      new_verification_status: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: '0-pending,1-done'
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
    })
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('user')
  }
}

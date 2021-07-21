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
      new_mobile: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: ''
      },
      mobile_otp: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      mobile_otp_expiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      new_email: {
        type:Sequelize.STRING(100),
        defaultsTo: ''
      },
      email_otp: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      email_otp_expiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      profile_image: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      is_kyc_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_mobile_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

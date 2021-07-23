'use strict';
const Constants = require('../services/Constants')
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('transaction', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            transaction_type: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: Constants.INACTIVE,
                comment: '0-membership_payment, 1-account_balance_user'
            },
            status: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: Constants.INACTIVE,
                comment: '0-success, 1-failed, 2-pending'
            },
            product: {
                type: Sequelize.INTEGER,
            },
            product_id: {
                type: Sequelize.INTEGER,
            },
            transaction: {
                type: Sequelize.INTEGER,
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
        await queryInterface.dropTable('transaction');
    }
};

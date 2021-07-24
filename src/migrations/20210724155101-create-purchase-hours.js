'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('purchase_hours', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING(30),
            },
            price: {
                type: Sequelize.INTEGER
            },
            hours: {
                type: Sequelize.INTEGER
            },
            type: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: '0-Gernal_Pricing, 1-BULK_PRICING'
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
        await queryInterface.dropTable('purchase_hours');
    }
};

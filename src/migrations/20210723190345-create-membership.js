'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('membership', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                allowNull: false,
                unique: true,
                type: Sequelize.STRING(30),
            },
            price: {
                type: Sequelize.INTEGER
            },
            individual_hrs: {
                type: Sequelize.INTEGER
            },
            group_pod_hrs: {
                type: Sequelize.INTEGER
            },
            terrace_hrs: {
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            perks: {
                type: Sequelize.STRING
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('membership');
    }
};

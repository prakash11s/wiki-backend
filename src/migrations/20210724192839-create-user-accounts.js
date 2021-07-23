'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        //id, userId,
        await queryInterface.createTable('user_accounts', {
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
            membership_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'membership',
                    key: 'id'
                }
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
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('user_accounts');
    }
};

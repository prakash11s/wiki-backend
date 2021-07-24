'use strict';
const Constants = require('../services/Constants');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('purchase_hours', [
            {
                name: 'INDIVIDUAL PODS',
                price: 500,
                hours: 1,
                type: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'GROUP PODS',
                price: 100,
                hours: 1,
                type: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'TERRACE',
                price: 400,
                hours: 1,
                type: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'INDIVIDUAL PODS',
                price: 3500,
                hours: 50,
                type: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'INDIVIDUAL PODS',
                price: 6500,
                hours: 100,
                type: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'GROUP PODS',
                price: 9333,
                hours: 25,
                type: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'GROUP PODS',
                price: 17000,
                hours: 50,
                type: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('purchase_hours', null, {})
    }
};

const Constants = require('../services/Constants');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('pods', [
            {
                name: 'Pod-1',
                type: Constants.POD_TYPE.GROUP,
                price: 50,
                location: 'to-right',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Pod-2',
                type: Constants.POD_TYPE.INDIVIDUAL,
                price: 40,
                location: 'to-right',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Pod-3',
                type: Constants.POD_TYPE.INDIVIDUAL,
                price: 500,
                location: 'to-right',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Pod-4',
                type: Constants.POD_TYPE.GROUP,
                price: 10,
                location: 'to-right',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Pod-5',
                type: Constants.POD_TYPE.INDIVIDUAL,
                price: 300,
                location: 'to-right',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Pod-6',
                type: Constants.POD_TYPE.GROUP,
                price: 90,
                location: 'to-right',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Pod-7',
                type: Constants.POD_TYPE.GROUP,
                price: 50,
                location: 'to-right',
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);
    },
    down: (queryInterface) => queryInterface.bulkDelete('pods', null, {})
};

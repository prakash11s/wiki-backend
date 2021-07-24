const Constants = require('../services/Constants');

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('terrace', [
      {
        name: 'Terrace-Pod-1',
        price: 50,
        location: 'to-right',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Terrace-Pod-2',
        price: 40,
        location: 'to-right',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Terrace-Pod-3',
        price: 500,
        location: 'to-right',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Terrace-Pod-4',
        price: 10,
        location: 'to-right',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Terrace-Pod-5',
        price: 300,
        location: 'to-right',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Terrace-Pod-6',
        price: 90,
        location: 'to-right',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Terrace-Pod-7',
        price: 50,
        location: 'to-right',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },
  down: (queryInterface) => queryInterface.bulkDelete('terrace', null, {})
};

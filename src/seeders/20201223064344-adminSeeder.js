const bcryptjs = require('bcryptjs');
const Constants = require('../services/Constants');

module.exports = {
    up: (queryInterface) => {
        const hash = bcryptjs.hashSync('admin@123', 10);

        return queryInterface.bulkInsert('admin', [{
            type: Constants.SUPER_ADMIN,
            name: 'superAdmin',
            email: 'admin@odyssey.com',
            mobile: '8888888888',
            password: hash,
            status: Constants.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    },
    down: (queryInterface) => queryInterface.bulkDelete('admin', null, {})
};

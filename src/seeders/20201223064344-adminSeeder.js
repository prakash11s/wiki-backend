const bcryptjs = require('bcryptjs');
const Constants = require('../services/Constants');

module.exports = {
  up: (queryInterface) => {
    const hash = bcryptjs.hashSync('admin@123', 10);

    return queryInterface.bulkInsert('admin', [{
      type: Constants.SUPER_ADMIN,
      name: 'superAdmin',
      email: 'admin@gmail.com',
      password: hash,
      reset_token: '',
      code_expiry: null,
      status: Constants.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },
  down: (queryInterface) => queryInterface.bulkDelete('admin', null, {})
};

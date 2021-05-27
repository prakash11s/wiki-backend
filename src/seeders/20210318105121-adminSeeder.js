const bcrypt = require('bcrypt')
const Constants = require('../services/Constants')

module.exports = {
  up: (queryInterface) => {
    const hash = bcrypt.hashSync('zykx@1234', 10)
    return queryInterface.bulkInsert('admin', [
      {
        name: 'admin',
        mobile: '9999999999',
        email: 'karan@gmail.com',
        password: hash,
        reset_token: '',
        code_expiry: null,
        status: Constants.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('admin', null, {})
  }
}

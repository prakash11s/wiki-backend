const _ = require('lodash')

module.exports = {
  isLocalAuth: (body) =>{
     return _.isUndefined(body.social_id) ||
      _.isNull(body.social_id) ||
      body.social_id === ''
  }
}

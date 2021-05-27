const Response = require('../services/Response')
const { Maintenance } = require('./../models')
const Constant = require('./../services/Constants')

module.exports = {
  maintenanceMode: async (req, res, next) => {
    // await Maintenance.findOne({
    //   where: {
    //     module: 'app'
    //   }
    // }).then((data) => {
    //   if (data) {
    //     if (data.mode === Constant.MAINTENANCE_MODE.DOWN) {
    //       Response.errorResponseData(res, res.locals.__('systemIsUnderMaintenanceMode'), 503)
    //       return null
    //     }
    //   }
    //   next()
    // })
    next()
  }
}

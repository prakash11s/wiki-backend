const Response = require('../services/Response')
const jwToken = require('../services/jwtToken')
const { Admin } = require('../models')
const {
  INACTIVE,
  ACTIVE
} = require('../services/Constants')

module.exports = {
  adminTokenAuth: async (req, res, next) => {
    const token = req.headers.authorization
    if (!token) {
      Response.errorResponseData(res, res.locals.__('authorizationError'), 401)
    } else {
      const tokenData = await jwToken.decode(token)
      if (tokenData) {
        // eslint-disable-next-line consistent-return
        jwToken.verify(tokenData, (err, decoded) => {
          if (err) {
            Response.errorResponseData(res, res.locals.__('invalidToken'), 401)
          }
          if (decoded.id) {
            req.authAdminId = decoded.id
            req.type = decoded.type
            // eslint-disable-next-line consistent-return
            Admin.findOne({
              where: {
                id: req.authAdminId,
              },
            }).then(async (result) => {
              if (!result) {
                return Response.errorResponseData(
                    res,
                    res.locals.__('invalidToken'),
                    401
                )
              } else {
                if (result && result.status === INACTIVE) {
                  return Response.errorResponseData(
                      res,
                      res.locals.__('accountIsInactive'),
                      401
                  )
                }
                if (result && result.status === ACTIVE) {
                  return next()
                } else {
                  return Response.errorResponseData(
                      res,
                      res.locals.__('accountBlocked'),
                      401
                  )
                }
              }
            })
          } else {
            return Response.errorResponseData(
                res,
                res.locals.__('invalidToken'),
                401
            )
          }
        })
      } else {
        return Response.errorResponseData(
            res,
            res.locals.__('invalidToken'),
            401
        )
      }
    }
    return null
  },
}

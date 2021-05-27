const bcrypt = require('bcrypt')
const Transformer = require('object-transformer')
const Response = require('../../services/Response')
const Constants = require('../../services/Constants')
const Helper = require('../../services/Helper')
const {
  loginValidation,
  forgotPasswordValidation,
  changePasswordValidation
} = require('../../services/AdminValidation')
const { login } = require('../../transformers/admin/AuthTransformer')
const { Admin } = require('../../models')
const { issueAdmin } = require('../../services/jwtToken')
const { Op } = require('sequelize')
const Mailer = require('../../services/Mailer')

module.exports = {

  /**
   * @description This function is for Admin Login.
   * @param req
   * @param res
   */
  login: async (req, res) => {
    const reqParam = req.fields
    loginValidation(reqParam, res, (validate) => {
      if (validate) {
        Admin.findOne({
          where: {
            email: reqParam.email,
            status: {
              [Op.ne]: Constants.DELETE
            }
          }
        }).then(
          (admin) => {
            if (admin) {
              if (admin.status === Constants.ACTIVE) {
                bcrypt.compare(
                  reqParam.password,
                  admin.password,
                  async (err, result) => {
                    if (err) {
                      return Response.errorResponseData(
                        res,
                        res.locals.__('emailPasswordNotMatch'),
                        null,
                        Constants.BAD_REQUEST
                      )
                    }
                    if (result) {
                      if (admin.code_expiry != null) {
                        if (admin.code_expiry.getTime() >= Date.now()) {
                          admin.code_expiry = null
                          await admin.save()
                        } else {
                          return Response.successResponseWithoutData(
                            res,
                            res.locals.__('passwordExpired'),
                            Constants.FAIL
                          )
                        }
                      }

                      const superAdminExpTime =
                        Math.floor(Date.now() / 1000) +
                        60 * 60 * 24 * process.env.SUPER_ADMIN_TOKEN_EXP
                      const payload = {
                        id: admin.id,
                        exp: superAdminExpTime
                      }
                      const token = issueAdmin(payload)
                      const meta = { token }
                      return Response.successResponseData(
                        res,
                        new Transformer.Single(admin, login).parse(),
                        Constants.SUCCESS,
                        res.locals.__('loginSuccess'),
                        meta
                      )
                    } else {
                      Response.successResponseWithoutData(
                        res,
                        res.locals.__('emailPasswordNotMatch'),
                        Constants.FAIL
                      )
                    }
                    return null
                  }
                )
              } else {
                Response.successResponseWithoutData(
                  res,
                  res.locals.__('accountIsInactive'),
                  Constants.FAIL
                )
              }
            } else {
              Response.successResponseWithoutData(
                res,
                res.locals.__('emailNotExist'),
                Constants.FAIL
              )
            }
          },
          () => {
            Response.errorResponseData(
              res,
              res.__('internalError'),
              Constants.INTERNAL_SERVER
            )
          }
        )
      }
    })
  },


  /**
   * @description This function is for Admin Forgot Password.
   * @param req
   * @param res
   */
  forgotPassword: async (req, res) => {
    const reqParam = req.fields
    forgotPasswordValidation(reqParam, res, (validate) => {
      if (validate) {
        Admin.findOne({
          where: {
            email: reqParam.email.toLowerCase(),
            status: {
              [Op.ne]: Constants.DELETE
            }
          }
        }).then(
          async (admin) => {
            if (admin) {
              if (admin.status === Constants.ACTIVE) {
                const minutesLater = new Date()
                const restTokenExpire = minutesLater.setMinutes(
                  minutesLater.getMinutes() + 60
                )
                const otp = await Helper.makeRandomNumber(10)
                const hash = bcrypt.hashSync(otp, 10)

                admin.password = hash
                admin.code_expiry = restTokenExpire

                await admin.save().then(
                  async (updatedAdmin) => {
                    if (!updatedAdmin) {
                      Response.errorResponseData(
                        res,
                        res.locals.__('accountIsInactive'),
                        Constants.BAD_REQUEST
                      )
                    } else {
                      const locals = {
                        username: admin.name,
                        appName: Helper.AppName,
                        otp
                      }
                      try {
                        const mail = await Mailer.sendMail(reqParam.email, 'Forgot Password', Helper.forgotTemplate, locals)
                        if (mail) {
                          return Response.successResponseData(res, null, Constants.SUCCESS, res.locals.__('forgotPasswordEmailSendSuccess'))
                        } else {
                          return Response.errorResponseData(res, res.locals.__('globalError'), Constants.INTERNAL_SERVER)
                        }
                      } catch (e) {
                        return Response.errorResponseData(
                          res,
                          e.message,
                          Constants.INTERNAL_SERVER
                        )
                      }
                    }
                    return null
                  },
                  () => {
                    Response.errorResponseData(
                      res,
                      res.__('internalError'),
                      Constants.INTERNAL_SERVER
                    )
                  }
                )
              } else {
                Response.errorResponseData(
                  res,
                  res.locals.__('accountIsInactive'),
                  Constants.BAD_REQUEST
                )
              }
            } else {
              Response.successResponseWithoutData(
                res,
                res.locals.__('emailNotExists'),
                Constants.FAIL
              )
            }
          },
          () => {
            Response.errorResponseData(
              res,
              res.__('internalError'),
              Constants.INTERNAL_SERVER
            )
          }
        )
      }
    })
  },


  /**
   * @description This function is for Admin Change Password.
   * @param req
   * @param res
   */
  changePassword: async (req, res) => {
    const { authUserId } = req
    const requestParams = req.fields
    changePasswordValidation(requestParams, res, async (validate) => {
      if (validate) {
        await Admin.findOne({
          where: {
            id: authUserId,
            status: {
              [Op.ne]: Constants.DELETE
            }
          }
        })
          .then(async (adminData) => {
            if (adminData) {
              bcrypt.compare(
                requestParams.old_password,
                adminData.password,
                async (err, oldPasswordRes) => {
                  if (err) {
                    Response.errorResponseData(
                      res,
                      res.__('somethingWentWrong'),
                      Constants.INTERNAL_SERVER
                    )
                  }
                  if (oldPasswordRes) {
                    bcrypt.compare(
                      requestParams.password,
                      adminData.password,
                      async (innerErr, newPasswordRes) => {
                        if (innerErr) {
                          Response.errorResponseData(
                            res,
                            res.__('somethingWentWrong'),
                            Constants.INTERNAL_SERVER
                          )
                        }
                        if (newPasswordRes) {
                          Response.successResponseWithoutData(
                            res,
                            res.__('oldNewPasswordSame'),
                            Constants.FAIL
                          )
                        } else {
                          bcrypt.hash(
                            requestParams.password,
                            10,
                            (bcryptErr, adminPassword) => {
                              if (bcryptErr) {
                                Response.errorResponseData(
                                  res,
                                  res.__('somethingWentWrong'),
                                  Constants.INTERNAL_SERVER
                                )
                              }
                              Admin.update(
                                {
                                  password: adminPassword
                                },
                                {
                                  where: {
                                    id: adminData.id
                                  }
                                }
                              ).then((update) => {
                                if (update) {
                                  Response.successResponseWithoutData(
                                    res,
                                    res.__('changePasswordSuccess')
                                  )
                                } else {
                                  Response.errorResponseData(
                                    res,
                                    res.__('somethingWentWrong'),
                                    Constants.INTERNAL_SERVER
                                  )
                                }
                              })
                            }
                          )
                        }
                      }
                    )
                  } else {
                    Response.successResponseWithoutData(
                      res,
                      res.__('oldPasswordNotMatch'),
                      Constants.FAIL
                    )
                  }
                }
              )
            } else {
              return Response.successResponseData(
                res,
                null,
                Constants.SUCCESS,
                res.locals.__('noAdminFound')
              )
            }
            return null
          })
          .catch(() => {
            Response.errorResponseData(
              res,
              res.__('internalError'),
              Constants.INTERNAL_SERVER
            )
          })
      } else {
        Response.errorResponseData(
          res,
          res.__('error'),
          Constants.INTERNAL_SERVER
        )
      }
    })
  }
}

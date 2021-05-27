const router = require('express').Router()
const formidableMiddleware = require('express-formidable')
const { maintenanceMode } = require('../../middlewares/app_module_maintenance_mode')
const connect = require('connect')
const {
  apiTokenAuth
} = require('../../middlewares/api')

const {
  userRegistration,
  checkSocialRegistration,
  login,
  verifyEmail,
  forgotPassword,
  changePassword
} = require('../../controllers/api/authController')

const authMiddleware = (() => {
  const chain = connect()
    ;[formidableMiddleware(), apiTokenAuth].forEach((middleware) => {
    chain.use(middleware)
  })
  return chain
})()

const authMiddlewareWithoutFormidable = (() => {
  const chain = connect()
    ;[apiTokenAuth].forEach((middleware) => {
    chain.use(middleware)
  })
  return chain
})()

router.post('/registration', [maintenanceMode], userRegistration)
router.post('/social-check', [maintenanceMode], checkSocialRegistration)
router.post('/login', [maintenanceMode], login)
router.post('/verify-user', [maintenanceMode], verifyEmail)
router.post('/forgot-password', [maintenanceMode], forgotPassword)
router.post('/change-password', [authMiddleware], changePassword)
module.exports = router

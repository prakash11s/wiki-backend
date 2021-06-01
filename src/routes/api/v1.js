const router = require('express').Router()
const formidableMiddleware = require('express-formidable')
const { maintenanceMode } = require('../../middlewares/app_module_maintenance_mode')
const connect = require('connect')
const {
  apiTokenAuth
} = require('../../middlewares/api')

const {
  userRegistration,
  login,
  verifyEmail,
  forgotPassword,
  changePassword,
  editProfile,
  kycAdd
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

router.post('/registration', formidableMiddleware(), [maintenanceMode], userRegistration)
router.post('/login', [maintenanceMode], login)
router.post('/verify-user', [maintenanceMode], verifyEmail)
router.post('/forgot-password', [maintenanceMode], forgotPassword)
router.post('/change-password', [authMiddleware], changePassword)
router.post('/edit/profile',  editProfile)
router.post('/add/kyc', [authMiddleware], kycAdd)
module.exports = router

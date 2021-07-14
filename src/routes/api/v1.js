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
  verifyNewEmail,
  forgotPassword,
  changePassword,
  editProfile,
  verifyNewMobile,
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
router.post('/verify-new-email', formidableMiddleware(), [maintenanceMode], verifyNewEmail)
router.post('/forgot-password', [maintenanceMode], forgotPassword)
router.post('/change-password', [authMiddleware], changePassword)
router.post('/edit/profile', formidableMiddleware(), [authMiddleware], editProfile)
router.post('/verify-new-mobile', formidableMiddleware(), [authMiddleware], verifyNewMobile)
router.post('/add/kyc', formidableMiddleware(), [authMiddleware], kycAdd)
module.exports = router

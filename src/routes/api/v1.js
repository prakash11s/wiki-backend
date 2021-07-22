const router = require('express').Router()
const formidableMiddleware = require('express-formidable')
const {maintenanceMode} = require('../../middlewares/app_module_maintenance_mode')
const connect = require('connect')
const {
    apiTokenAuth
} = require('../../middlewares/api')

const {
    userRegistration,
    login,
    userEmailVerification,
    userMobileVerification,
    verifyNewEmail,
    forgotPassword,
    changePassword,
    editProfile,
    verifyNewMobile,
    myDetails
} = require('../../controllers/api/authController')

const {
    kycAdd,
    kycDetails,
    updateKyc
} = require('../../controllers/api/kycController')

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
router.post('/login', [maintenanceMode], login)
router.post('/verify-email', [maintenanceMode], userEmailVerification)
router.post('/verify-mobile', [maintenanceMode], userMobileVerification)
router.post('/forgot-password', [maintenanceMode], forgotPassword)
router.post('/change-password', [authMiddleware], changePassword)
router.post('/edit-profile', formidableMiddleware(), [authMiddleware], editProfile)
router.post('/verify-new-email', formidableMiddleware(), [maintenanceMode], verifyNewEmail)
router.post('/verify-new-mobile', formidableMiddleware(), [authMiddleware], verifyNewMobile)
router.get('/my-details', formidableMiddleware(), [authMiddleware], myDetails)


//KYC Module
router.post('/submit-kyc', formidableMiddleware(), [authMiddleware], kycAdd)
router.post('/my-kyc-details', formidableMiddleware(), [authMiddleware], kycDetails)
router.post('/update-kyc', formidableMiddleware(), [authMiddleware], updateKyc)



module.exports = router

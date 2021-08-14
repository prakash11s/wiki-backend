const router = require('express').Router()
const formidableMiddleware = require('express-formidable')
const connect = require('connect')
const {
    adminTokenAuth
} = require('../../middlewares/admin')
const {
    login,
    forgotPassword,
    changePassword
} = require('../../controllers/admin/authController')
const {
    subAdminAddEdit,
    subAdminList,
    subAdminDetail,
    subAdminUpdateStatus,
} = require('../../controllers/admin/SubAdminController');
const {
    userList, userUpdateStatus, userDetail
} = require('../../controllers/admin/UserController');

const {
    addEditMembership, membershipList
} = require('../../controllers/admin/MembershipController');

const {userKycDetails, updateUserKYCStatus, kycList} = require('../../controllers/admin/KYCController')

const authMiddleware = (() => {
    const chain = connect()
    ;[formidableMiddleware(), adminTokenAuth].forEach((middleware) => {
        chain.use(middleware)
    })
    return chain
})()

const authMiddlewareWithoutForm = (() => {
    const chain = connect()
    ;[adminTokenAuth].forEach((middleware) => {
        chain.use(middleware)
    })
    return chain
})()

// LRF
router.post('/login', formidableMiddleware(), login)
router.post('/forgot-password', formidableMiddleware(), forgotPassword)
router.post('/change-password', authMiddleware, changePassword)

// sub-admin
router.post('/sub-admin', formidableMiddleware(), authMiddleware, subAdminAddEdit);
router.get('/sub-admin', formidableMiddleware(), authMiddleware, subAdminList);
router.get('/sub-admin/:id', formidableMiddleware(), authMiddleware, subAdminDetail);
router.post('/sub-admin-update-status', formidableMiddleware(), authMiddleware, subAdminUpdateStatus);

// user
router.get('/user-list', authMiddlewareWithoutForm, userList);
router.post('/user-status-update', formidableMiddleware(), authMiddleware, userUpdateStatus);
router.get('/user-detail/:id', formidableMiddleware(), authMiddleware, userDetail);
router.get('/user-kyc/:user_id', formidableMiddleware(), authMiddleware, userKycDetails);
router.get('/kyc-list', authMiddlewareWithoutForm, kycList);
router.post('/user-kyc-update/:user_id', authMiddlewareWithoutForm, updateUserKYCStatus);

//Membership
router.post('/membership', authMiddlewareWithoutForm, addEditMembership);
router.get('/membership-list', authMiddlewareWithoutForm, membershipList);

module.exports = router

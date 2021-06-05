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

const authMiddleware = (() => {
  const chain = connect()
    ;[formidableMiddleware(), adminTokenAuth].forEach((middleware) => {
    chain.use(middleware)
  })
  return chain
})()

router.post('/login', formidableMiddleware(), login)
router.post('/forgot-password', formidableMiddleware(), forgotPassword)
router.post('/change-password', authMiddleware, changePassword)

module.exports = router

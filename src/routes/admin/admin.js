const router = require('express').Router()
const formidableMiddleware = require('express-formidable')
const connect = require('connect')
const {
  adminTokenAuth
} = require('../../middlewares/admin')

const authMiddleware = (() => {
  const chain = connect()
    ;[formidableMiddleware(), adminTokenAuth].forEach((middleware) => {
    chain.use(middleware)
  })
  return chain
})()

module.exports = router

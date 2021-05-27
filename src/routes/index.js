const router = require('express').Router()
const adminRoute = require('./admin/admin')
const appRoute = require('./api/index')


// Admin router
router.use('/admin', adminRoute)

// APP router
router.use('/api', appRoute)

// Image router
// router.get('/storage/:folder/:image', fetchImage)
// router.get('/storage/:folder/:folder2/:image', fetchImage)

module.exports = router

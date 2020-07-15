const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')
// const isActivated = require('../middleware/activate')
const isUnderMaintenance = require('../middleware/maintenance')
const activity = require('../middleware/activity')
// user login
router.post(
  '/login',
  isUnderMaintenance,
  activity,
  authController.authenticateUser
)

// user logout
router.post(
  '/logout',
  activity,
  authController.logout
)

// logout all sessions
router.post(
  '/logoutAll',
  activity,
  authController.logoutAll
)

module.exports = router

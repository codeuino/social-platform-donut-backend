const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')
// const isActivated = require('../middleware/activate')
const isUnderMaintenance = require('../middleware/maintenance')

// user login
router.post(
  '/login',
  isUnderMaintenance,
  authController.authenticateUser
)

// user logout
router.post(
  '/logout',
  authController.logout
)

// logout all sessions
router.post(
  '/logoutAll',
  authController.logoutAll
)

module.exports = router

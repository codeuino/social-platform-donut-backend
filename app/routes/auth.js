const express = require('express')
const router = express.Router()
const User = require('../models/User')
const AuthClass = require('../controllers/auth')
const authController = new AuthClass(User)
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

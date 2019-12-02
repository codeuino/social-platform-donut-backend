const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')

// user login
router.post(
  '/login',
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

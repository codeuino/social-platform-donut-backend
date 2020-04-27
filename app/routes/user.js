const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const auth = require('../middleware/auth')
// const email = require('../middleware/email')

// create a user
router.post(
  '/',
  // email,
  userController.createUser
)

// get user profile
router.get(
  '/me',
  auth,
  userController.userProfile
)

// update user info
router.patch(
  '/me',
  auth,
  userController.userProfileUpdate
)

// user forgot password request
router.post(
  '/password_reset',
  userController.forgotPasswordRequest
)

// update password
router.post(
  '/password_reset/:token',
  userController.updatePassword
)

// activate account
router.post(
  '/activate/:token',
  userController.activateAccount
)

// delete a user
router.delete(
  '/me',
  auth,
  userController.userDelete
)

module.exports = router

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

// get invite link (for sender)
router.get(
  '/invite',
  auth,
  userController.getInviteLink
)

// process invite link (for receiver)
router.get(
  '/invite/:token',
  userController.processInvite
)

// activate account
router.get(
  '/activate/:token',
  userController.activateAccount
)

// delete a user
router.delete(
  '/me',
  auth,
  userController.userDelete
)

// LOGOUT USER
router.post(
  '/logout',
  auth,
  userController.logout
)

module.exports = router

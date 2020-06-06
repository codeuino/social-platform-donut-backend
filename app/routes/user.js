const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const auth = require('../middleware/auth')
const isUnderMaintenance = require('../middleware/maintenance')
// const email = require('../middleware/email')

// create a user
router.post(
  '/',
  isUnderMaintenance,
  // email,
  userController.createUser
)

// get user profile
router.get(
  '/me',
  isUnderMaintenance,
  auth,
  userController.userProfile
)

// update user info
router.patch(
  '/me',
  isUnderMaintenance,
  auth,
  userController.userProfileUpdate
)

// user forgot password request
router.post(
  '/password_reset',
  isUnderMaintenance,
  userController.forgotPasswordRequest
)

// update password
router.post(
  '/password_reset/:token',
  isUnderMaintenance,
  userController.updatePassword
)

// get invite link (for sender)
router.get(
  '/invite',
  isUnderMaintenance,
  auth,
  userController.getInviteLink
)

// process invite link (for receiver)
router.get(
  '/invite/:token',
  isUnderMaintenance,
  userController.processInvite
)

// activate account
router.get(
  '/activate/:token',
  isUnderMaintenance,
  userController.activateAccount
)

// delete a user
router.delete(
  '/me',
  isUnderMaintenance,
  auth,
  userController.userDelete
)

module.exports = router

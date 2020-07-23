const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const auth = require('../middleware/auth')
const isUnderMaintenance = require('../middleware/maintenance')
// const email = require('../middleware/email')
const activity = require('../middleware/activity')

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
router.patch(
  '/password_reset/request',
  isUnderMaintenance,
  userController.forgotPasswordRequest
)

// update password
router.patch(
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

// LOGOUT USER
router.post(
  '/logout',
  auth,
  userController.logout,
  activity
)

// follow the user
router.patch(
  '/follow',
  isUnderMaintenance,
  auth,
  userController.addFollowing,
  userController.addFollower,
  activity
)

// unFollow the user
router.patch(
  '/unfollow',
  isUnderMaintenance,
  auth,
  userController.removeFollowing,
  userController.removeFollower,
  activity
)

// BLOCK THE USER
router.patch(
  '/block/:id',
  isUnderMaintenance,
  auth,
  userController.blockUser
)

// UNBLOCK THE USER
router.patch(
  '/unblock/:id',
  isUnderMaintenance,
  auth,
  userController.unBlockUser
)

// GET PERSONAL OVERVIEW
router.get(
  '/overview',
  isUnderMaintenance,
  auth,
  userController.getPersonalOverview
)

// REMOVE USER
router.patch(
  '/remove/:id',
  isUnderMaintenance,
  auth,
  userController.removeUser
)

module.exports = router

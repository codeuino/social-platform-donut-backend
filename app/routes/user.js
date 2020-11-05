const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const auth = require('../middleware/auth')
const isUnderMaintenance = require('../middleware/maintenance')
const OAuthMiddlewares = require('../middleware/OAuthMiddlewares')

// const email = require('../middleware/email')
// create a user
router.post(
  '/',
  isUnderMaintenance,
  // email,
  userController.createUser
)

// load user (endpoint used to call when someone opens app)
router.get(
  '/load_user',
  isUnderMaintenance,
  auth,
  userController.loadUser
)

// get user profile
router.get(
  '/:id',
  isUnderMaintenance,
  auth,
  userController.userProfile
)

// update user info
router.patch(
  '/:id',
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
  '/link/invite',
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
  userController.logout
)

// follow the user
router.patch(
  '/follow/:id',
  isUnderMaintenance,
  auth,
  userController.addFollowing,
  userController.addFollower
)

// unFollow the user
router.patch(
  '/unfollow/:id',
  isUnderMaintenance,
  auth,
  userController.removeFollowing,
  userController.removeFollower
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
  '/me/overview',
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

// DEACTIVATE ACCOUNT BY USER
router.patch(
  '/deactivate/toggler',
  isUnderMaintenance,
  auth,
  userController.deactivateAccount
)

// Redirect user to Google Accounts
router.get(
  '/auth/google',
  isUnderMaintenance,
  OAuthMiddlewares.passportGoogleAuthenticate
)

// Receive Callback from Google Accounts after successful Auth
router.get(
  '/auth/google/callback',
  isUnderMaintenance,
  OAuthMiddlewares.passportGoogleAuthenticateCallback
)

// Redirect user to GitHub Accounts
router.get(
  '/auth/github',
  isUnderMaintenance,
  OAuthMiddlewares.passportGitHubAuthenticate
)
// Receive Callback from GitHub Accounts after successful Auth
router.get(
  '/auth/github/callback',
  isUnderMaintenance,
  OAuthMiddlewares.passportGitHubAuthenticateCallback
)

module.exports = router

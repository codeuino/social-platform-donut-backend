const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const auth = require('../middleware/auth')

// create a user
router.post(
  '/',
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
// delete a user
router.delete(
  '/me',
  auth,
  userController.userDelete
)

module.exports = router

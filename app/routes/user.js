const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')

// create a user
router.post(
  '/',
  userController.createUser
)

// get user profile
router.get(
  '/me',
  userController.userProfile
)

// update user info
router.patch(
  '/me',
  userController.userProfileUpdate
)

// delete a user
router.delete(
  '/me',
  userController.userDelete
)

module.exports = router

const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const auth = require('../middleware/auth')
const upload = require('../middleware/avatar')

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

// delete a user
router.delete(
  '/me',
  auth,
  userController.userDelete
)

router.post(
  '/me/avatar',
  auth,
  upload.single('avatar'),
  userController.uploadUserImage
)

router.delete(
  '/me/avatar',
  auth,
  userController.deleteUserImage
)

router.get(
  '/:id/avatar',
  auth,
  userController.getUserImage
)

module.exports = router

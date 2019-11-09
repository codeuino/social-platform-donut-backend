const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

// create a user
router.post('/', userController.createUser);

// user login
router.post('/login', userController.authenticateUser);

// user logout
router.post('/logout', userController.logout)

// logout all sessions
router.post('/logoutAll', userController.logoutAll)

// get user profile
router.get('/me', userController.userProfile)

// update user info
router.patch('/me', userController.userProfileUpdate)

// delete a user
router.delete('/me', userController.userDelete)

module.exports = router;
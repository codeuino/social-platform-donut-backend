const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

// create a user
router.post('/', userController.create);

// user login
router.post('/login', userController.authenticate);

// user logout
router.get('/logout', userController.test)

// logout all sessions
router.get('/logoutAll', userController.test)

// get user profile
router.get('/me', userController.test)

// update user info
router.get('/me', userController.test)

// delete a user
router.get('/me', userController.test)

module.exports = router;
const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')

// user login
router.post(
  '/login',
  authController.authenticateUser
)

// user logout
router.post(
  '/logout',
  authController.logout
)

// logout all sessions
router.post(
  '/logoutAll',
  authController.logoutAll
)
router.post('/forgetpassword',authController.forgetpassword)

//url to be hit by frontend to check the validity of token
router.get('/reset',authController.checkvalidity);

//post request to be hit by page when the forget password link will be active
router.post('/changepassword',authController.changepassword)

//url to be routed after 
module.exports = router

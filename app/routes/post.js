const express = require('express')
const router = express.Router()
const userController = require('../controllers/post')
const checkAuth = require('../middleware/auth')

// CREATE A POST
router.post(
  '/',
  userController.create
)

// GET ALL POSTS OF A USER
router.get(
  '/',
  userController.authenticate
)

// GET PARTICULAR POST OF A USER
router.get(
  '/:id',
  userController.test
)

// UPDATE A TASK
router.patch(
  '/:id',
  checkAuth,
  userController.update
)

// DELETE A TASK

router.delete(
  '/:id',
  userController.test
)

module.exports = router

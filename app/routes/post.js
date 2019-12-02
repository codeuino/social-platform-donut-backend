const express = require('express')
const router = express.Router()
const userController = require('../controllers/post')

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
  userController.test
)

// DELETE A TASK
router.delete(
  '/:id',
  userController.test
)

module.exports = router

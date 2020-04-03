require('../../config/mongoose')
const express = require('express')
const router = express.Router()
const userController = require('../controllers/post')
const upload = require('../middleware/file-upload')
const auth = require('../middleware/auth')

// CREATE A POST
router.post(
  '/',
  auth,
  upload.single('imgUrl'),
  userController.create
)

router.get(
  '/auth',
  userController.authenticate
)

// GET ALL POSTS
router.get(
  '/all_posts',
  auth,
  userController.getAllPost
)

// UPDATE A TASK
router.patch(
  '/:id',
  auth,
  upload.single('imgUrl'),
  userController.updatePost
)

// DELETE A TASK
router.delete(
  '/:id',
  auth,
  userController.delete
)

// GET TASK BY ID
router.get(
  '/:id',
  auth,
  userController.getPostById
)

router.put(
  '/upvote/:id/:userId',
  userController.upvote
)

router.put(
  '/downvote/:id/:userId',
  userController.downvote
)

module.exports = router

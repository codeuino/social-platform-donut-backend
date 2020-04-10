require('../../config/mongoose')
const express = require('express')
const router = express.Router()
const userController = require('../controllers/post')
const uploader = require('../utils/uploader')
const auth = require('../middleware/auth')

// CREATE A POST
router.post(
  '/',
  auth,
  uploader.upload.single('image'),
  userController.create
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
  uploader.upload.single('image'),
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
  '/upvote/:id',
  auth,
  userController.upvote
)

router.put(
  '/downvote/:id',
  auth,
  userController.downvote
)

module.exports = router

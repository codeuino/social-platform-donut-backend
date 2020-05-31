require('../../config/mongoose')
const express = require('express')
const router = express.Router()
const postController = require('../controllers/post')
const uploader = require('../utils/uploader')
const auth = require('../middleware/auth')

// CREATE A POST
router.post(
  '/',
  auth,
  uploader.upload.single('image'),
  postController.create
)

// GET ALL POSTS
router.get(
  '/all_posts',
  auth,
  postController.getAllPost
)

// UPDATE POST
router.patch(
  '/:id',
  auth,
  uploader.upload.single('image'),
  postController.updatePost
)

// DELETE A POST BY ID
router.delete(
  '/:id',
  auth,
  postController.delete
)

// GET POST BY ID
router.get(
  '/:id',
  auth,
  postController.getPostById
)

// UPVOTE POST BY POST ID
router.patch(
  '/upvote/:id',
  auth,
  postController.upvote
)

// GET POST PER USER
router.get(
  '/me/all',
  auth,
  postController.getPostByUser
)

module.exports = router

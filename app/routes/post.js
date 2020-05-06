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

// UPDATE POST
router.patch(
  '/:id',
  auth,
  uploader.upload.single('image'),
  userController.updatePost
)

// DELETE A POST BY ID
router.delete(
  '/:id',
  auth,
  userController.delete
)

// GET POST BY ID
router.get(
  '/:id',
  auth,
  userController.getPostById
)

// UPVOTE POST BY POST ID
router.patch(
  '/upvote/:id',
  auth,
  userController.upvote
)

module.exports = router

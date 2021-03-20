require('../../config/mongoose')
const express = require('express')
const router = express.Router()
const postController = require('../controllers/post')
const fileToBuffer = require('../utils/fileToBuffer')
const auth = require('../middleware/auth')
const isUnderMaintenance = require('../middleware/maintenance')
const compressAndUpload = require('../utils/compressAndUpload')

// CREATE A POST
router.post(
  '/',
  isUnderMaintenance,
  auth,
  fileToBuffer.processFile.single('image'),
  compressAndUpload.imageCompressor,
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
  isUnderMaintenance,
  auth,
  fileToBuffer.processFile.single('image'),
  compressAndUpload.imageCompressor,
  postController.updatePost
)

// DELETE A POST BY ID
router.delete(
  '/:id',
  isUnderMaintenance,
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
  isUnderMaintenance,
  auth,
  postController.upvote
)

// REMOVE REACTION FROM POST
router.patch(
  '/removereaction/:id',
  isUnderMaintenance,
  auth,
  postController.removeReaction
)

// GET POST PER USER
router.get(
  '/:id/all',
  auth,
  postController.getPostByUser
)

// PIN THE POST
router.patch(
  '/pin/:id/',
  auth,
  postController.pinPost
)

// GET ALL PINNED POSTS
router.get(
  '/all/pinned/',
  auth,
  postController.getPinned
)

module.exports = router

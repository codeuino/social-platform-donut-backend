const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const commentController = require('../controllers/comment')

// CREATE COMMENT
router.post(
  '/:id',
  auth,
  commentController.comment
)

// DELETE COMMENT BY ID
router.delete(
  '/:id',
  auth,
  commentController.delete
)

// UPDATE COMMENT BY ID
router.patch(
  '/:id',
  auth,
  commentController.update
)

// GET COMMENT BY POST ID
router.get(
  '/:id',
  auth,
  commentController.getCommentByPost
)

// UPVOTE COMMENT BY COMMENT ID
router.patch(
  '/upvote/:id',
  auth,
  commentController.upvote
)

// DOWNVOTE COMMENT BY COMMENT ID
router.patch(
  '/downvote/:id',
  auth,
  commentController.downvote
)

module.exports = router

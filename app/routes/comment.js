const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const isUnderMaintenance = require('../middleware/maintenance')
const CommentModel = require('../models/Comment')
const CommentClass = require('../controllers/comment')
const commentController = new CommentClass(CommentModel)

// CREATE COMMENT
router.post(
  '/:id',
  isUnderMaintenance,
  auth,
  commentController.comment
)

// DELETE COMMENT BY ID
router.delete(
  '/:id',
  isUnderMaintenance,
  auth,
  commentController.delete
)

// UPDATE COMMENT BY ID
router.patch(
  '/:id',
  isUnderMaintenance,
  auth,
  commentController.update
)

// GET COMMENT BY POST ID
router.get(
  '/:id',
  isUnderMaintenance,
  auth,
  commentController.getCommentByPost
)

// UPVOTE COMMENT BY COMMENT ID
router.patch(
  '/upvote/:id',
  isUnderMaintenance,
  auth,
  commentController.upvote
)

// DOWNVOTE COMMENT BY COMMENT ID
router.patch(
  '/downvote/:id',
  isUnderMaintenance,
  auth,
  commentController.downvote
)

module.exports = router

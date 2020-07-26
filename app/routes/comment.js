const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const commentController = require('../controllers/comment')
const isUnderMaintenance = require('../middleware/maintenance')
const activity = require('../middleware/activity')

// CREATE COMMENT
router.post(
  '/:id',
  isUnderMaintenance,
  auth,
  commentController.comment,
  activity
)

// DELETE COMMENT BY ID
router.delete(
  '/:id',
  isUnderMaintenance,
  auth,
  commentController.delete,
  activity
)

// UPDATE COMMENT BY ID
router.patch(
  '/:id',
  isUnderMaintenance,
  auth,
  commentController.update,
  activity
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
  commentController.upvote,
  activity
)

// DOWNVOTE COMMENT BY COMMENT ID
router.patch(
  '/downvote/:id',
  isUnderMaintenance,
  auth,
  commentController.downvote,
  activity
)

module.exports = router

const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const commentController = require('../controllers/comment')

router.post(
  '/',
  auth,
  commentController.comment
)

router.delete(
  '/:id',
  auth,
  commentController.delete
)

router.patch(
  '/:id',
  auth,
  commentController.update
)

router.get(
  '/:id',
  auth,
  commentController.getCommentByPost
)

router.put(
  '/upvote/:id',
  auth,
  commentController.upvote
)

router.put(
  '/downvote/:id',
  auth,
  commentController.downvote
)

module.exports = router

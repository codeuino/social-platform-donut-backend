const express = require('express')
const router = express.Router()
const commentController = require('../controllers/comment')

router.post(
  '/',
  commentController.comment
)

router.delete(
  '/:id',
  commentController.delete
)

router.patch(
  '/:id/:userId',
  commentController.update
)

router.get(
  '/:id',
  commentController.getCommentByPost
)

router.put(
  '/upvote/:id/:userId',
  commentController.upvote
)

router.put(
  '/downvote/:id/:userId',
  commentController.downvote
)

module.exports = router

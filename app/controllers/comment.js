const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const CommentModel = require('../models/Comment')
const permission = require('../utils/permission')
const helper = require('../utils/paginate')

module.exports = {
  // CREATE COMMENT (ISSUE IN CREATE COMMENT )
  comment: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const comment = new CommentModel(req.body)
      comment.userId = userId
      comment.postId = id // added postId
      await comment.save()
      res.status(HttpStatus.CREATED).json({ comment: comment })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // DELETE COMMENT
  delete: async (req, res, next) => {
    const { id } = req.params
    try {
      const comment = await CommentModel.findById(id)
      if (!comment) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No comment exist' })
      }
      // Add rights for admins and moderators as well (TODO)
      if (!permission.check(req, res, comment.userId)) {
        return res.status(HttpStatus.FORBIDDEN).json({ message: 'Bad delete request' })
      }
      await CommentModel.findByIdAndRemove(id)
      res.status(HttpStatus.OK).json({ comment: comment })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // UPDATE COMMENT
  update: async (req, res, next) => {
    const { id } = req.params
    const updates = Object.keys(req.body)
    const valid = ['content']
    const isValidOperation = updates.every((update) => {
      return valid.includes(update)
    })
    if (!isValidOperation) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Wrong Update Request' })
    }
    try {
      const comment = await CommentModel.findById(id)
      if (!comment) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No comment exist' })
      }
      // also add admin or moderator control (TODO)
      if (!permission.check(req, res, comment.userId)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Wrong update' })
      }
      updates.forEach(update => {
        comment[update] = req.body[update]
      })
      await comment.save()
      res.status(HttpStatus.OK).json({ comment: comment })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // GET ALL COMMENTS OF A POST BY postId
  getCommentByPost: async (req, res, next) => {
    const { id } = req.params
    try {
      const comments = await CommentModel.find({ postId: id }, {}, helper.paginate(req))
        .populate('userId', ['name.firstName', 'name.lastName'])
        .sort({ updatedAt: -1 })
        .lean()
        .exec()
      if (!comments) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No such post' })
      }
      res.status(HttpStatus.OK).json({ comments: comments })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // UPVOTE COMMENT
  upvote: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const comment = await CommentModel.findById(id)
      if (!comment) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No comment found' })
      }
      // CHECKS IF THE USER HAS ALREADY UPVOTED THE COMMENT
      comment.votes.upVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            error: 'Bad request'
          })
        }
      })
      // CHECKS IF THE USER HAS ALREADY DOWNVOTED THE COMMENT
      comment.votes.downVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          comment.votes.downVotes.user.remove(user)
        }
      })
      comment.votes.upVotes.user.unshift(userId)
      await comment.save()
      return res.status(HttpStatus.OK).json({ comment: comment })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // DOWNVOTE COMMENT
  downvote: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const comment = await CommentModel.findById(id)
      if (!comment) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No comment found' })
      }
      // CHECKS IF THE USER HAS ALREADY DOWNVOTED THE COMMENT
      comment.votes.downVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            error: 'Bad request'
          })
        }
      })
      // CHECKS IF THE USER HAS ALREADY UPVOTED THE COMMENT
      comment.votes.upVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          comment.votes.upVotes.user.remove(user)
        }
      })
      comment.votes.downVotes.user.unshift(userId)
      await comment.save()
      return res.status(HttpStatus.OK).json({ comment: comment })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

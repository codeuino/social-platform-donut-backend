const HANDLER = require('../utils/response-helper')
const STATUS = require('../utils/status-codes')
const CommentModel = require('../models/Comment')
const consoleHelper = require('../utils/console-helper')

module.exports = {
  comment: async (req, res, next) => {
    const comment = new CommentModel(req.body)
    const userId = req.user.id.toString()
    comment.userId = userId
    try {
      await comment.save()
      res.status(STATUS.CREATED).json({ comment: comment })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  delete: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    consoleHelper(id)
    try {
      const comment = await CommentModel.findById(id)
      if (!comment) {
        return res.status(STATUS.NOT_FOUND).json({ error: 'No comment exixts' })
      }
      if (JSON.stringify(comment.userId) !== JSON.stringify(userId)) {
        return res.status(STATUS.FORBIDDEN).json({ message: 'Bad delete request' })
      }
      await CommentModel.findByIdAndRemove(id)
      res.status(STATUS.OK).json({ comment: comment })
    } catch (error) {
      consoleHelper(error)
      HANDLER.handleError(res, error)
    }
  },
  update: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    const updates = Object.keys(req.body)
    const valid = ['content']
    let isValidUpdate = true
    if (JSON.stringify(updates) !== JSON.stringify(valid)) {
      isValidUpdate = false
    }
    if (!isValidUpdate) {
      return res.status(STATUS.BAD_REQUEST).json({ error: 'Wrong Update Request' })
    }
    try {
      const comment = await CommentModel.findById(id)
      if (!comment) {
        return res.status(STATUS.NOT_FOUND).json({ error: 'No comment exixts' })
      }
      if (JSON.stringify(comment.userId) !== JSON.stringify(userId)) {
        return res.status(STATUS.BAD_REQUEST).json({ error: 'Wrong update' })
      }
      updates.forEach(update => {
        comment[update] = req.body[update]
      })
      await comment.save()
      consoleHelper(comment)
      res.status(STATUS.UPDATED).json({ comment: comment })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  getCommentByPost: async (req, res, next) => {
    const { id } = req.params
    try {
      const comments = await CommentModel.find({ postId: id }).populate('userId').exec()
      if (!comments) {
        return res.status(STATUS.NOT_FOUND).json({ error: 'No such post' })
      }
      res.status(STATUS.OK).json({ comments: comments, success: true })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  upvote: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const comment = await CommentModel.findById(id)
      if (!comment) {
        return res.status(STATUS.NOT_FOUND).json({ error: 'No comment found' })
      }
      // CHECKS IF THE USER HAS ALREADY UPVOTED THE COMMENT
      comment.votes.upVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          return res.status(STATUS.BAD_REQUEST).json({ error: 'Bad request' })
        }
      })
      // CHECKS IF THE USER HAS ALREADY DOWNVOTED THE COMMENT
      comment.votes.downVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          comment.votes.downVotes.count = comment.votes.downVotes.count - 1
          comment.votes.downVotes.user.remove(user)
        }
      })
      comment.votes.upVotes.count = comment.votes.upVotes.count + 1
      comment.votes.upVotes.user.push(userId)
      await comment.save()
      res.status(STATUS.OK).json({ comment: comment, message: 'Success' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  downvote: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const comment = await CommentModel.findById(id)
      if (!comment) {
        return res.status(STATUS.NOT_FOUND).json({ error: 'No comment found' })
      }
      // CHECKS IF THE USER HAS ALREADY DOWNVOTED THE COMMENT
      comment.votes.downVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          return res.status(STATUS.BAD_REQUEST).json({ error: 'Bad request' })
        }
      })
      // CHECKS IF THE USER HAS ALREADY UPVOTED THE COMMENT
      comment.votes.upVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          comment.votes.upVotes.count = comment.votes.upVotes.count - 1
          comment.votes.upVotes.user.remove(user)
        }
      })
      comment.votes.downVotes.count = comment.votes.downVotes.count + 1
      comment.votes.downVotes.user.push(userId)
      await comment.save()
      res.status(STATUS.OK).json({ comment: comment, message: 'Success' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

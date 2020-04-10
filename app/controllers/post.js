const PostModel = require('../models/Post')
const HANDLER = require('../utils/response-helper')
const STATUS = require('../utils/status-codes')
const imgUploadHelper = require('../utils/uploader')
const consoleHelper = require('../utils/console-helper')

module.exports = {
  create: async (req, res, next) => {
    const post = new PostModel(req.body)
    const userId = req.user.id.toString()
    post.userId = userId
    if (req.file) {
      imgUploadHelper.mapToDb(req, post)
    }
    try {
      await post.save()
      res.status(STATUS.CREATED).json({ post })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  delete: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const post = await PostModel.findById(id)
      if (!post) {
        return res.status(STATUS.NOT_FOUND).json({ message: 'No post exists' })
      }
      if (JSON.stringify(userId) !== JSON.stringify(post.userId)) {
        return res.status(STATUS.FORBIDDEN).json({ message: 'Bad delete request' })
      }
      await PostModel.findByIdAndRemove(id)
      res.status(STATUS.OK).json({ post: post, message: 'Deleted the post' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  updatePost: async (req, res, next) => {
    const { id } = req.params
    consoleHelper(id)
    const updates = Object.keys(req.body)
    const allowedUpdates = ['content', 'imgUrl']
    const userId = req.user.id.toString()
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
      return res.status(STATUS.BAD_REQUEST).json({ message: 'Invalid Update' })
    }
    try {
      const post = await PostModel.findById(id)
      if (!post) {
        return res.status(STATUS.BAD_REQUEST).json({ message: 'No post exists' })
      }
      if (JSON.stringify(userId) !== JSON.stringify(post.userId)) {
        return res.status(STATUS.FORBIDDEN).json({ message: 'Bad update request' })
      }
      consoleHelper(post)
      updates.forEach(update => {
        post[update] = req.body[update]
      })
      if (req.file) {
        imgUploadHelper.mapToDb(req, post)
      }
      await post.save()
      res.status(STATUS.UPDATED).json({ post: post })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  getPostById: async (req, res, next) => {
    const { id } = req.params
    try {
      const post = await PostModel.findById(id)
      if (!post) {
        return res.status(STATUS.NOT_FOUND).json({ error: 'Post not found' })
      }
      res.status(STATUS.OK).json({ post: post })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  getAllPost: async (req, res, next) => {
    try {
      const posts = await PostModel.find({})
      if (!posts.length) {
        return res.status(STATUS.NOT_FOUND).json({ message: 'No posts found' })
      }
      res.status(STATUS.OK).json({ posts: posts })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  upvote: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const post = await PostModel.findById(id)
      if (!post) {
        return res.status(STATUS.NOT_FOUND).json({ error: 'No post found' })
      }
      // CHECKS IF THE USER HAS ALREADY UPVOTED THE COMMENT
      post.votes.upVotes.users.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          return res.status(STATUS.BAD_REQUEST).json({ error: 'Bad request' })
        }
      })
      // CHECKS IF THE USER HAS ALREADY DOWNVOTED THE COMMENT
      post.votes.downVotes.users.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          post.votes.downVotes.count = post.votes.downVotes.count - 1
          post.votes.downVotes.users.remove(user)
        }
      })
      post.votes.upVotes.count = post.votes.upVotes.count + 1
      post.votes.upVotes.users.push(userId)
      await post.save()
      res.status(STATUS.OK).json({ post: post, message: 'Success' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  downvote: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const post = await PostModel.findById(id)
      if (!post) {
        return res.status(STATUS.NOT_FOUND).json({ error: 'No post found' })
      }
      // CHECKS IF THE USER HAS ALREADY DOWNVOTED THE COMMENT
      post.votes.downVotes.users.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          return res.status(STATUS.BAD_REQUEST).json({ error: 'Bad request' })
        }
      })
      // CHECKS IF THE USER HAS ALREADY UPVOTED THE COMMENT
      post.votes.upVotes.users.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          post.votes.upVotes.count = post.votes.upVotes.count - 1
          post.votes.upVotes.users.remove(user)
        }
      })
      post.votes.downVotes.count = post.votes.downVotes.count + 1
      post.votes.downVotes.users.push(userId)
      await post.save()
      res.status(STATUS.OK).json({ post: post, message: 'Success' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

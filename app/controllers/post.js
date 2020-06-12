const PostModel = require('../models/Post')
const UserModel = require('../models/User')
const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const imgUploadHelper = require('../utils/uploader')
const helper = require('../utils/paginate')

module.exports = {
  // CREATE POST
  create: async (req, res, next) => {
    const post = new PostModel(req.body)
    const userId = req.user.id.toString()
    post.userId = userId
    if (req.file) {
      imgUploadHelper.mapToDb(req, post)
    }
    try {
      await post.save()
      // req.io.emit('new post created', { data: post.content })
      return res.status(HttpStatus.CREATED).json({ post })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // DELETE POST
  delete: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const post = await PostModel.findById(id)
      if (!post) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'No post exists' })
      }
      // TODO ADD ADMIN RIGHTS AS WELL
      if (JSON.stringify(userId) !== JSON.stringify(post.userId)) {
        return res.status(HttpStatus.FORBIDDEN).json({ message: 'Bad delete request' })
      }
      await PostModel.findByIdAndRemove(id)
      res.status(HttpStatus.OK).json({ post: post, msg: 'Deleted!' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // UPDATE POST
  updatePost: async (req, res, next) => {
    const { id } = req.params
    const updates = Object.keys(req.body)
    const allowedUpdates = ['content', 'imgUrl']
    const userId = req.user.id.toString()
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid Update' })
    }
    try {
      const post = await PostModel.findById(id)
      if (!post) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'No post exists' })
      }
      if (JSON.stringify(userId) !== JSON.stringify(post.userId)) {
        return res.status(HttpStatus.FORBIDDEN).json({ message: 'Bad update request' })
      }
      updates.forEach(update => {
        post[update] = req.body[update]
      })
      if (req.file) {
        imgUploadHelper.mapToDb(req, post)
      }
      await post.save()
      res.status(HttpStatus.OK).json({ post: post })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // GET POST BY ID
  getPostById: async (req, res, next) => {
    const { id } = req.params
    try {
      const post = await PostModel.findById(id)
        .populate('comments', ['content', 'votes'])
        .populate('userId', ['name.firstName', 'name.lastName', 'email', 'isAdmin'])
        .lean()
        .exec()
      if (!post) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'Post not found' })
      }
      res.status(HttpStatus.OK).json({ post: post })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // GET ALL THE POSTS
  getAllPost: async (req, res, next) => {
    try {
      const posts = await PostModel.find({}, {}, helper.paginate(req))
        .populate('userId', ['name.firstName', 'name.lastName', 'email', 'isAdmin'])
        .sort({ updatedAt: -1 })
        .exec()
      if (!posts.length) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'No posts found' })
      }
      return res.status(HttpStatus.OK).json({ posts: posts })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // UPVOTE POST
  upvote: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const post = await PostModel.findById(id)
      if (!post) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No post found' })
      }
      // CHECKS IF THE USER HAS ALREADY UPVOTED THE COMMENT
      post.votes.upVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Bad request' })
        }
      })
      post.votes.upVotes.user.unshift(userId)
      await post.save()
      res.status(HttpStatus.OK).json({ post: post })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  getPostByUser: async (req, res, next) => {
    try {
      const posts = await PostModel.find({ userId: req.user._id }, {}, helper.paginate(req))
        .populate('comments', ['content', 'votes'])
        .sort({ updatedAt: -1 })
        .exec()
      if (posts.length === 0) {
        return res.status(HttpStatus.OK).json({ msg: 'No posts found!' })
      }
      return res.status(HttpStatus.OK).json({ posts })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // PIN THE POST
  pinPost: async (req, res, next) => {
    const { id } = req.params
    try {
      const post = await PostModel.findById(id)
      const user = await UserModel.findById(req.user._id)
      if (!post) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No such post exists!' })
      }
      // toggle pinned post
      post.isPinned = !post.isPinned
      // if already pinned then remove from their pinned items
      const PinnedItems = user.pinned.postId
      if (PinnedItems.length > 0) {
        const pinnedPostIndex = PinnedItems.indexOf(id)
        user.pinned.postId.splice(pinnedPostIndex, 1)
        await user.save()
      } else {
        // save to the user pinned items
        user.pinned.postId.unshift(id)
        await user.save()
      }
      await post.save()
      return res.status(HttpStatus.OK).json({ post })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // GET ALL PINNED POST
  getPinned: async (req, res, next) => {
    try {
      const posts = await PostModel.find({})
      if (posts.length === 0) {
        return res.status(HttpStatus.OK).json({ msg: 'No post to show!' })
      }
      // check for pinned post
      const pinnedPost = posts.filter((post) => {
        return post.isPinned === true
      })
      if (pinnedPost.length === 0) {
        return res.status(HttpStatus.OK).json({ msg: 'No post pinned yet!' })
      }
      // else return pinned posts
      return res.status(HttpStatus.OK).json({ pinnedPost })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

const userModel = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const PostModel = require('../models/Post')

module.exports = {
  create: async (req, res, next) => {
    const url = req.protocol + '://' + req.get('host')
    let post
    if (req.file) { // WHEN AN IMAGE IS UPLOADED
      const imgUrl = url + '/public/' + req.file.filename
      post = new PostModel({
        imgUrl: imgUrl,
        content: req.body.content,
        votes: {
          upVotes: {
            count: req.body.votes.upVotes.count,
            users: req.body.votes.upVotes.users
          },
          downVotes: {
            count: req.body.votes.downVotes.count,
            users: req.body.votes.downVotes.users
          }
        }
      })
    } else { // WHEN THE IMAGE IS NOT UPLOADED
      post = new PostModel({
        content: req.body.content,
        votes: {
          upVotes: {
            count: req.body.votes.upVotes.count,
            users: req.body.votes.upVotes.users
          },
          downVotes: {
            count: req.body.votes.downVotes.count,
            users: req.body.votes.downVotes.users
          }
        }
      })
    }
    try {
      await post.save()
      res.status(201).json({ post: post })
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error })
    }
  },
  delete: async (req, res, next) => {
    const { id } = req.params
    console.log(id)
    try {
      const post = await PostModel.findByIdAndRemove(id)
      if (!post) {
        return res.status(400).json({ message: 'No post exists' })
      }
      res.status(200).json({ post: post, message: 'Deleted the post' })
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error })
    }
  },
  updatePost: async (req, res, next) => {
    const { id } = req.params
    console.log(id)
    const updates = Object.keys(req.body)
    const allowedUpdates = ['content', 'imgUrl']
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid Update' })
    }
    try {
      const post = await PostModel.findById(id)
      console.log(post)
      updates.forEach(update => {
        post[update] = req.body[update]
      })
      if (req.file) {
        post.imgUrl = req.protocol + '://' + req.get('host') + '/public/' + req.file.filename
      }
      await post.save()
      res.status(204).json({ post: post })
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error })
    }
  },
  authenticate: function (req, res, next) {
    userModel.findOne({ email: req.body.email }, function (err, userInfo) {
      if (err) {
        next(err)
      } else {
        if (bcrypt.compareSync(req.body.password, userInfo.password)) {
          const token = jwt.sign({ id: userInfo._id }, req.app.get('secretKey'), { expiresIn: '1h' })
          res.json({ status: 'success', message: 'user found!!!', data: { user: userInfo, token: token } })
        } else {
          res.json({ status: 'error', message: 'Invalid email/password!!!', data: null })
        }
      }
    })
  },
  test: function (req, res, next) {
    res.status(201).json({ message: 'Hey, I am working' })
  }
}

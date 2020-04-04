const CommentModel = require('../models/Comment')

module.exports = {
  comment: async (req, res, next) => {
    const comment = new CommentModel(req.body)
    try {
      await comment.save()
      res.status(201).json({ comment: comment })
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error })
    }
  },
  delete: async (req, res, next) => {
    const { id } = req.params
    console.log(id)
    try {
      const comment = await CommentModel.findByIdAndRemove(id)
      if (!comment) {
        return res.status(404).json({ error: 'No comment exixts' })
      }
      res.status(200).json({ comment: comment })
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error })
    }
  },
  update: async (req, res, next) => {
    const { id, userId } = req.params
    const updates = Object.keys(req.body)
    const valid = ['content']
    let isValidUpdate = true
    if (JSON.stringify(updates) !== JSON.stringify(valid)) {
      isValidUpdate = false
    }
    if (!isValidUpdate) {
      return res.status(400).json({ error: 'Wrong Update Request' })
    }
    try {
      const comment = await CommentModel.findById(id)
      if (JSON.stringify(comment.userId) !== JSON.stringify(userId)) {
        return res.status(400).json({ error: 'Wrong update' })
      }
      updates.forEach(update => {
        comment[update] = req.body[update]
      })
      await comment.save()
      res.status(204).json({ comment: comment })
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error })
    }
  },
  getCommentByPost: async (req, res, next) => {
    const { id } = req.params
    try {
      const comments = await CommentModel.find({ postId: id }).populate('userId').exec()
      if (!comments) {
        return res.status(404).json({ error: 'No such post' })
      }
      res.status(200).json({ comments: comments, success: true })
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error })
    }
  },
  upvote: async (req, res, next) => {
    const { id, userId } = req.params
    try {
      const comment = await CommentModel.findById(id)
      if (!comment) {
        return res.status(404).json({ error: 'No comment found' })
      }
      // CHECKS IF THE USER HAS ALREADY UPVOTED THE COMMENT
      comment.votes.upVotes.user.user_id.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          return res.status(400).json({ error: 'Bad request' })
        }
      })
      // CHECKS IF THE USER HAS ALREADY DOWNVOTED THE COMMENT
      comment.votes.downVotes.user.user_id.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          comment.votes.downVotes.count = comment.votes.downVotes.count - 1
          comment.votes.downVotes.user.user_id.remove(user)
        }
      })
      comment.votes.upVotes.count = comment.votes.upVotes.count + 1
      comment.votes.upVotes.user.user_id.push(userId)
      await comment.save()
      res.status(200).json({ comment: comment, message: 'Success' })
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error })
    }
  },
  downvote: async (req, res, next) => {
    const { id, userId } = req.params
    try {
      const comment = await CommentModel.findById(id)
      if (!comment) {
        return res.status(404).json({ error: 'No comment found' })
      }
      // CHECKS IF THE USER HAS ALREADY DOWNVOTED THE COMMENT
      comment.votes.downVotes.user.user_id.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          return res.status(400).json({ error: 'Bad request' })
        }
      })
      // CHECKS IF THE USER HAS ALREADY UPVOTED THE COMMENT
      comment.votes.upVotes.user.user_id.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          comment.votes.upVotes.count = comment.votes.upVotes.count - 1
          comment.votes.upVotes.user.user_id.remove(user)
        }
      })
      comment.votes.downVotes.count = comment.votes.downVotes.count + 1
      comment.votes.downVotes.user.user_id.push(userId)
      await comment.save()
      res.status(200).json({ comment: comment, message: 'Success' })
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error })
    }
  }
}

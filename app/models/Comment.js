const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema

const commentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    validate (userId) {
      if (validator.isEmpty(userId)) {
        throw new Error('UserId is required!')
      }
    }
  },
  postId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Post',
    validate (userId) {
      if (validator.isEmpty(userId)) {
        throw new Error('PostID is required!')
      }
    }
  },
  content: {
    type: String,
    trim: true,
    required: true,
    validate (content) {
      if (validator.isEmpty(content)) {
        throw new Error('Comment can not be empty!')
      }
    }
  },
  votes: {
    upVotes: {
      count: {
        type: Number,
        default: 0
      },
      user: {
        user_id: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'User'
        }
      }
    },
    downVotes: {
      count: {
        type: Number,
        default: 0
      },
      user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      }
    }
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now()
  }
})

module.exports = mongoose.model('Comment', commentSchema)

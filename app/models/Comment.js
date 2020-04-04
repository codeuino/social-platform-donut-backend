const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema

const commentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  postId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Post'
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
        user_id: [{
          type: Schema.Types.ObjectId,
          ref: 'User'
        }]
      }
    },
    downVotes: {
      count: {
        type: Number,
        default: 0
      },
      user: {
        user_id: [{
          type: Schema.Types.ObjectId,
          ref: 'User'
        }]
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

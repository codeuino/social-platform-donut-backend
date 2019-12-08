const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema

const commentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  postId: {
    type: Schema.Types.ObjectId,
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
  votes: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      upVotes: {
        type: Number,
        default: 0
      },
      downVotes: {
        type: Number,
        default: 0
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('Comment', commentSchema)

const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema

const PostSchema = new Schema({
  postTitle: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    validate (postTitle) {
      if (validator.isEmpty(postTitle)) {
        throw new Error('Post title is required!')
      }
      if (!validator.isLength(postTitle, { min: 5 })) {
        throw new Error('Title should be min 5 characters long!')
      }
    }
  },
  content: {
    type: String,
    trim: true,
    required: true,
    validate (content) {
      if (validator.isEmpty(content)) {
        throw new Error('Post content can not be empty!')
      }
    }
  },
  votes: {
    upVotes: {
      count: {
        type: Number,
        default: 0
      },
      users: {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        }
      }
    },
    downVotes: {
      count: {
        type: Number,
        default: 0
      },
      users: {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        }
      }
    }
  },
  comments: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
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

module.exports = mongoose.model('Post', PostSchema)

const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema

const PostSchema = new Schema({
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
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  image: {
    data: Buffer,
    contentType: String
  },
  imgUrl: {
    type: String,
    trim: true,
    validator (imgUrl) {
      if (!validator.isURL(imgUrl)) {
        throw new Error('Invalid image URL!')
      }
    }
  },
  votes: {
    upVotes: {
      count: {
        type: Number,
        default: 0
      },
      users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    downVotes: {
      count: {
        type: Number,
        default: 0
      },
      users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }]
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

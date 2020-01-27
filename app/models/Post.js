const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema

const postSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  postTitle: {
    type: String,
    trim: true,
    required: true,
    validate (postTitle) {
      if (validator.isEmpty(postTitle)) {
        throw new Error('Post title should be there!!')
      }
    }
  },
  postContent: {
    type: String,
    required: true,
    trim: true,
    validate (postContent) {
      if (validator.isEmpty(postContent)) {
        throw new Error('Post content can not be empty!')
      }
    }
  },
  image: {
    data: Buffer,
    contentType: String
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  dislikes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [
    {
      text: {
        type: String,
        trim: true,
        validate (text) {
          if (validator.isEmpty(text)) {
            throw new Error('Comment can not be empty!!')
          }
        },
        name: {
          type: String
        },
        avatar: {
          type: String
        },
        postedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        createdAt: {
          type: Date,
          default: Date.now()
        }
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('Posts', postSchema)

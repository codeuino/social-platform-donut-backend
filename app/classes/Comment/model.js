const validator = require('validator')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// class Model - Abstract Class - cannot be instantiated
//   public - accessible to inheriting classes
//     getModel()
//   private
//     schema
//     model

class Model {
  constructor () {
    if (this.constructor === Model) {
      throw new Error("Can't instantiate abstract class!")
    }
  }

  #schema = new Schema({
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
    votes: {
      upVotes: {
        user: [
          {
            type: Schema.Types.ObjectId,
            ref: 'User'
          }
        ]
      },
      downVotes: {
        user: [
          {
            type: Schema.Types.ObjectId,
            ref: 'User'
          }
        ]
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

  #model = mongoose.model('Comment', this.#schema);

  getModel () {
    return this.#model
  }
}

module.exports = Model

const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema
const commentSchema = require('./Comment').schema

const ticketSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Pending', 'Closed'],
    default: 'Open',
    required: true
  },
  content: {
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      validate (shortDescription) {
        if (validator.isEmpty(shortDescription)) {
          throw new Error('Short description is required!')
        }
        if (!validator.isLength(shortDescription, { min: 10 })) {
          throw new Error('Short description should be min 5 characters long!')
        }
      }
    },
    longDescription: {
      type: String,
      trim: true,
      minlength: 10,
      validate (longDescription) {
        if (validator.isEmpty(longDescription)) {
          throw new Error('Long description is required!')
        }
        if (!validator.isLength(longDescription, { min: 10 })) {
          throw new Error('Long description should be min 10 characters long!')
        }
      }
    }
  },
  tags: [
    {
      type: String,
      trim: true,
      validate: (value) => {
        if (!validator.isLength(value, { min: 0, max: 20 })) {
          throw new Error('Tags should have between 0 to 20 characters')
        }
      }
    }
  ],
  history: [
    {
      title: {
        type: String,
        trim: true
      },
      content: {
        shortDescription: {
          type: String,
          trim: true
        },
        longDescription: {
          type: String,
          trim: true
        }
      },
      editedAt: {
        type: Date,
        required: true,
        default: Date.now()
      },
      editedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ],
  comments: [commentSchema], // mongoose subdocument
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

module.exports = mongoose.model('Ticket', ticketSchema)

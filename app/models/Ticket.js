const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema

const ticketCommentSchema = new Schema({
  createdBy: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    shortDescription: {
      type: String,
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
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
      user: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    downVotes: {
      user: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }]
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

const ticketSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: true
  },
  number: {
    type: Number,
    required: true
  },
  createdBy: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    shortDescription: {
      type: String,
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED', 'PENDING', 'SOLVED', 'ON_HOLD'],
    default: 'OPEN',
    required: true
  },
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
  content: {
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
      type: {
        type: String,
        trim: true
      },
      title: {
        old: {
          type: String,
          trim: true
        },
        new: {
          type: String,
          trim: true
        }
      },
      status: {
        type: String,
        trim: true
      },
      shortDescription: {
        type: String,
        trim: true
      },
      content: {
        type: String,
        trim: true
      },
      tag: {
        type: String,
        trim: true
      },
      updatedAt: {
        type: Date,
        required: true,
        default: Date.now()
      },
      updatedBy: {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        name: {
          type: String,
          trim: true
        }
      }
    }
  ],
  comments: [ticketCommentSchema], // mongoose subdocument
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

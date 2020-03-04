const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema

const eventSchema = new Schema({
  eventName: {
    type: String,
    trim: true,
    required: true,
    minlength: 5,
    validate (eventName) {
      if (validator.isEmpty(eventName)) {
        throw new Error('Event name is required!')
      }
      if (!validator.isLength(eventName, { min: 5 })) {
        throw new Error('Event name should be min 5 characters long!')
      }
    }
  },
  description: {
    shortDescription: {
      type: String,
      trim: true,
      required: true,
      minlength: 5,
      validate (description) {
        if (!validator.isLength(description, { min: 5 })) {
          throw new Error('Short description should be min 5 characters long! ')
        }
        if (validator.isEmpty(description)) {
          throw new Error('Short description of event is required!')
        }
      }
    },
    longDescription: {
      type: String,
      trim: true,
      required: true,
      minlength: 10,
      validate (longDescription) {
        if (!validator.isLength(longDescription, { min: 10 })) {
          throw new Error('Long description should be min 10 characters long! ')
        }
        if (validator.isEmpty(longDescription)) {
          throw new Error('Long description of event is required!')
        }
      }
    }
  },
  rsvp: {
    yes: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    no: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    mayBe: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  slots: {
    type: Number,
    required: true,
    default: 0,
    validate (slots) {
      if (validator.isEmpty(slots)) {
        throw new Error('Slots is required!')
      }
    }
  },
  location: {
    type: String,
    required: true,
    trim: true,
    validate (location) {
      if (validator.isEmpty(location)) {
        throw new Error('Event location is required!')
      }
    }
  },
  eventDate: {
    type: Date,
    required: true,
    validate (eventDate) {
      if (validator.isEmpty(eventDate)) {
        throw new Error('Event date is required!')
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
module.exports = mongoose.model('Event', eventSchema)

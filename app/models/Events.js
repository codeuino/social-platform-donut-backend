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
    type: String,
    trim: true,
    required: true,
    minlength: 10,
    validate (description) {
      if (!validator.isLength(description, { min: 10 })) {
        throw new Error('Description should be min 10 characters long! ')
      }
      if (validator.isEmpty(description)) {
        throw new Error('Description of event is required!')
      }
    }
  },
  rsvp: {
    accepted: {
      type: Number,
      default: 0
    },
    rejected: {
      type: Number,
      default: 0
    },
    noResponse: {
      type: Number,
      default: 0
    }
  },
  slots: {
    type: Number,
    default: 0
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
    type: String,
    required: true,
    validate (eventDate) {
      if (validator.isEmpty(eventDate)) {
        throw new Error('Event date is required!')
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  }
})
module.exports = mongoose.model('Event', eventSchema)

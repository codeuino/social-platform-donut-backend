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
  eventTime: {
    type: String
  },
  rsvpYes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  rsvpMaybe: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  rsvpNo: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  slots: {
    type: String,
    default: 0,
    validate (slots) {
      if (!validator.isNumeric(slots)) {
        throw new Error('Slots should be a number')
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
    default: Date.now()
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isOnline: {
    type: Boolean,
    default: false
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

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const validator = require('validator')

const orgSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    validate (name) {
      if (validator.isEmpty(name)) {
        throw new Error('Organization name is required!')
      }
      if (!validator.isLength(name, { min: 3 })) {
        throw new Error('Organization name should be min 3 characters long!')
      }
    }
  },
  description: {
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
  contactInfo: {
    emailId: {
      type: String,
      required: true,
      validate (emailId) {
        if (validator.isEmpty(emailId)) {
          throw new Error('EmailId or org is required!')
        }
        if (!validator.isEmail(emailId)) {
          throw new Error('Invalid emailId')
        }
      }
    },
    website: {
      type: String,
      trim: true,
      required: true,
      validate (website) {
        if (validator.isEmpty(website)) {
          throw new Error('Organization website is required!')
        }
        if (!validator.isURL(website)) {
          throw new Error('Invalid website url!')
        }
      }
    },
    chattingPlatform: [
      {
        link: {
          type: String
        }
      }
    ]
  },
  adminInfo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatorInfo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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
module.exports = mongoose.model('Organization', orgSchema)

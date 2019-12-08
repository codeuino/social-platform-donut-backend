const mongoose = require('mongoose')
const Schema = mongoose.Schema
const validator = require('validator')

const orgSchema = new Schema({
  orgName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    validate (orgName) {
      if (validator.isEmpty(orgName)) {
        throw new Error('Organization name is required!')
      }
      if (!validator.isLength(orgName, { min: 3 })) {
        throw new Error('Organization name should be min 3 characters long!')
      }
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    validate (description) {
      if (validator.isEmpty(description)) {
        throw new Error('Description is required!')
      }
      if (!validator.isLength(description, { min: 10 })) {
        throw new Error('Description should be min 10 characters long!')
      }
    }
  },
  contactInfo: {
    communityEmail: {
      type: String
    },
    slackChannel: {
      type: String
    },
    discordChannel: {
      type: String
    },
    githubLink: {
      type: String,
      required: true,
      validate (githubLink) {
        if (validator.isEmpty(githubLink)) {
          throw new Error('Github link is required!')
        }
      }
    }
  },
  adminInfo: {
    name: {
      type: String,
      required: true,
      trim: true,
      validate (name) {
        if (validator.isEmpty(name)) {
          throw new Error('Admin name is required!')
        }
      }
    },
    email: {
      type: String,
      required: true,
      validate (email) {
        if (!validator.isEmail(email)) {
          throw new Error('Invalid admin emailId')
        }
      }
    },
    slackHandle: {
      type: String
    },
    githubHandle: {
      type: String
    }
  },
  moderatorInfo: {
    name: {
      type: String,
      trim: true,
      validate (name) {
        if (validator.isEmpty(name)) {
          throw new Error('Moderator name is required!')
        }
      },
      email: {
        type: String,
        trim: true
      },
      slackHandle: {
        type: String
      },
      githubHandle: {
        type: String
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
module.exports = mongoose.model('Organization', orgSchema)

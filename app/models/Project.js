const mongoose = require('mongoose')
const Schema = mongoose.Schema
const validator = require('validator')

const projectSchema = new Schema({
  projectName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    validate (projectName) {
      if (validator.isEmpty(projectName)) {
        throw new Error('Project name is required!')
      }
      if (!validator.isLength(projectName, { min: 3 })) {
        throw new Error('Project name should be 3 characters long!')
      }
    }
  },
  description: {
    short: {
      type: String,
      required: true,
      trim: true,
      validate (short) {
        if (validator.isEmpty(short)) {
          throw new Error('Short description for the project is required!')
        }
      }
    },
    long: {
      type: String,
      trim: true
    }
  },
  techStacks: [],
  image: {
    type: Buffer,
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
  version: {
    type: String,
    trim: true
  },
  links: [
    {
      githubLink: {
        type: String,
        trim: true,
        validate (githubLink) {
          if (!validator.isURL(githubLink)) {
            throw new Error('Invalid project url!')
          }
        }
      },
      bitbucketLink: {
        type: String,
        trim: true
      }
    }
  ],
  contributors: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  maintainers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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

module.exports = mongoose.model('Project', projectSchema)

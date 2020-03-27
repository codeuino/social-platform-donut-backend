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
      minlength: 10,
      validate (short) {
        if (validator.isEmpty(short)) {
          throw new Error('Short description for the project is required!')
        }
        if (!validator.isLength(short, { min: 10, max: 200 })) {
          throw new Error('Short description should be min 10 characters long!')
        }
      }
    },
    long: {
      type: String,
      trim: true
    }
  },
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
    trim: true,
    required: true,
    validate (version) {
      if (validator.isEmpty(version)) {
        throw new Error('Short description for the project is required!')
      }
    }
  },
  links: [
    {
      githubLink: {
        type: String,
        required: true,
        trim: true,
        validate (githubLink) {
          if (validator.isEmpty(githubLink)) {
            throw new Error('Project github link is required!')
          }
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

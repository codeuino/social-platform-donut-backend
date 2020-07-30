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
  image: {
    data: Buffer,
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
  contactInfo: {
    email: {
      type: String,
      required: true,
      validate (email) {
        if (validator.isEmpty(email)) {
          throw new Error('EmailId or org is required!')
        }
        if (!validator.isEmail(email)) {
          throw new Error('Invalid emailId')
        }
      }
    },
    adminEmail: {
      type: String,
      trim: true
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
        _id: false,
        link: {
          type: String
        }
      }
    ]
  },
  options: {
    _id: false,
    settings: {
      enableEmail: {
        type: Boolean,
        default: true
      },
      language: {
        type: String,
        enum: ['English', 'French', 'German'],
        default: 'English'
      },
      canEdit: {
        type: Boolean,
        default: true
      },
      editingLimit: {
        type: String,
        default: 'Always'
      },
      timeFormat: {
        type: String,
        enum: ['24', '12'],
        default: '12'
      }
    },
    permissions: {
      sendInvite: {
        type: String,
        enum: ['BOTH', 'ADMINS', 'NONE'],
        default: 'BOTH'
      },
      canCreateManage: {
        type: String,
        enum: ['BOTH', 'ADMINS', 'MEMBERS'],
        default: 'BOTH'
      },
      canChangeEmail: {
        type: Boolean,
        default: true
      },
      canChangeName: {
        type: Boolean,
        default: true
      }
    },
    authentication: {
      email: {
        type: Boolean,
        default: true
      },
      google: {
        type: Boolean,
        default: false
      },
      github: {
        type: Boolean,
        default: false
      },
      gitlab: {
        type: Boolean,
        default: false
      }
    }
  },
  adminInfo: {
    _id: false,
    adminId: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  moderatorInfo: {
    _id: false,
    adminId: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isMaintenance: {
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
module.exports = mongoose.model('Organization', orgSchema)

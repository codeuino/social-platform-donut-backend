const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const saltRounds = 8

// user schema
const UserSchema = new mongoose.Schema({
  name: {
    firstName: {
      type: String,
      trim: true,
      required: true,
      validate (firstName) {
        if (validator.isEmpty(firstName)) {
          throw new Error('First name field can not be empty!')
        }
      }
    },
    lastName: {
      type: String,
      trim: true,
      validate (lastName) {
        if (validator.isEmpty(lastName)) {
          throw new Error('Last name field can not be empty!')
        }
      }
    }
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    lowercase: true,
    validate (email) {
      if (!validator.isEmail(email)) {
        throw new Error('Invalid emailId')
      }
      if (validator.isEmpty(email)) {
        throw new Error('Email is required!')
      }
    }
  },
  phone: {
    type: String,
    trim: true,
    minlength: 10,
    validate (phone) {
      if (!validator.isLength(phone, { min: 10, max: 10 })) {
        throw new Error('Phone number is invalid!')
      }
    }
  },
  password: {
    type: String,
    trim: true,
    required: true,
    minlength: 6,
    validate (password) {
      if (!validator.isLength(password, { min: 6 })) {
        throw new Error('Password should be min 6 characters long!')
      }
      if (validator.isEmpty(password)) {
        throw new Error('Password is required!')
      }
    }
  },
  socialMedia: {
    youtube: {
      type: String
    },
    facebook: {
      type: String
    },
    twitter: {
      type: String
    },
    github: {
      type: String
    },
    linkedin: {
      type: String
    }
  },
  info: {
    about: {
      shortDescription: {
        type: String,
        validate (shortDescription) {
          if (validator.isEmpty(shortDescription)) {
            throw new Error('Short description is required')
          }
        }
      },
      longDescription: {
        type: String
      },
      website: {
        type: String,
        trim: true,
        validate (website) {
          if (!validator.isURL(website)) {
            throw new Error('Invalid website link!')
          }
        }
      },
      designation: {
        type: String,
        trim: true
      },
      education: [
        {
          _id: false,
          school: {
            schoolName: {
              type: String,
              trim: true
            },
            year: {
              type: String
            }
          }
        }
      ],
      skills: [
        {
          type: String
        }
      ],
      location: {
        type: String,
        trim: true
      }
    }
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  notifications: [
    {
      heading: {
        type: String
      },
      content: {
        type: String
      },
      tag: {
        type: String
      }
    }
  ],
  proposalNotifications: [
    {
      heading: {
        type: String
      },
      content: {
        type: String
      },
      tag: {
        type: String
      },
      createdAt: {
        type: Date,
        required: true,
        default: Date.now()
      }
    }
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  followings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  blocked: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  pinned: {
    _id: false,
    postId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      }
    ]
  },
  firstRegister: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActivated: {
    type: Boolean,
    default: false
  },
  isRemoved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
    select: true
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now()
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ]
})

// generate auth token
// Schema Methods, needs to be invoked by an instance of a Mongoose document
UserSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign(
    { _id: user._id.toString() },
    'process.env.JWT_SECRET'
  )

  user.tokens = user.tokens.concat({ token: token })
  await user.save()

  return token
}

// Schema Statics are methods that can be invoked directly by a Model
UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({
    email: email
  })

  if (!user) {
    throw new Error('No such user')
  } else {
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new Error('Incorrect password provided')
    } else {
      return user
    }
  }
}

// hash user password before saving into database
UserSchema.pre('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, saltRounds)
  }

  next()
})

const User = mongoose.model('User', UserSchema)
module.exports = User

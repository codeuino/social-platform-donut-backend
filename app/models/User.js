const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const saltRounds = 8

// user schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    validate (name) {
      if (validator.isEmpty(name)) {
        throw new Error('Name field can not be empty!')
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
    }
  },
  phone: {
    type: String,
    trim: true,
    unique: true,
    required: true,
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
      if (validator.toLowerCase().includes('password')) {
        throw new Error('Password cannot be password')
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
    instagram: {
      type: String
    },
    linkedin: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}
)

// generate auth token
// Schema Methods, needs to be invoked by an instance of a Mongoose document
UserSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

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
    throw new Error('Unable to login')
  } else {
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new Error('Unable to login')
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

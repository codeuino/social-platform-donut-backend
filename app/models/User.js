const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const saltRounds = 8

// user schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
      validate (email) {
        if (!validator.isEmail(email)) {
          throw new Error('Invalid emailid')
        }
      }
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minlength: 6,
      validate (password) {
        if (password.toLowerCase().includes('password')) {
          throw new Error('Password cannot be password')
        }
      }
    },
    tokens: [{
      token: {
        type: String,
        required: true
      }
    }]
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
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

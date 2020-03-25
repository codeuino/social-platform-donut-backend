const User = require('../models/User')
const jwt = require('jsonwebtoken')

module.exports = {
  createUser: async (req, res, next) => {
    const user = new User(req.body)
    try {
      await user.save()
      const token = await user.generateAuthToken()
      res.status(201).json({ user: user, token: token })
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error })
    }
  },

  userProfile: async (req, res, next) => {
    res.json(req.user)
  },

  userProfileUpdate: async (req, res, next) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'company', 'website', 'location', 'about']
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
      return res.status(400).json({ error: 'invalid update' })
    }

    try {
      updates.forEach((update) => {
        req.user[update] = req.body[update]
      })
      await req.user.save()
      res.status(200).json({ data: req.user })
    } catch (error) {
      res.status(400).json({ error })
    }
  },

  forgotPasswordRequest: async (req, res) => {
    const { email } = req.body
    try {
      const user = await User.findOne({ email: email })
      if (!user) {
        res.status(404).json({ msg: 'User not found!' })
      }
      const token = jwt.sign({ _id: user._id, expiry: Date.now() + 10800000 }, process.env.JWT_SECRET)
      await user.save()
      return res.status(200).json({ success: true, token })
    } catch (error) {
      if (process.env.NODE_ENV !== 'production' && error) {
        console.log('Error in forgotPasswordRequest ', error)
      }
      res.status(400).json({ error })
    }
  },

  updatePassword: async (req, res) => {
    const { password, id } = req.body
    const { token } = req.params
    try {
      const decodedtoken = jwt.verify(token, process.env.JWT_SECRET)

      if (Date.now() <= decodedtoken.expiry) {
        const user = await User.findById({
          _id: id
        })
        if (!user) {
          return res.status(400).json({ msg: 'No such user' })
        }
        user.password = password
        await user.save()
        return res.status(200).json({ updated: true })
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log('token expired')
        }
        res.status(400).json({ error: 'Token expired' })
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production' && error) {
        console.log('Something went wrong ', error)
      }
      res.status(400).json({ error })
    }
  },

  logout: (req, res, next) => {
    res.json({ success: 'ok' })
  },

  userDelete: async (req, res, next) => {
    try {
      await req.user.remove()
      res.send({ data: 'user deletion successful', user: req.user })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error })
    }
  }
}

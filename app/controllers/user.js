const User = require('../models/User')
const crypto = require('crypto')

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
        res.status(404).json({ success: false, msg: `User with ${email} is not found!` })
      }
      var token = await crypto.randomBytes(32).toString('hex')
      if (!token && process.env.NODE_ENV !== 'production') {
        console.log('Token not generated in forgotPasswordRequest')
      }
      user.resetPassToken = token
      user.resetPassTokenExpireIn = Date.now() + 3600000 // 1hr
      await user.save()
      return res.status(200).json({ success: true, token })
    } catch (error) {
      if (process.env.NODE_ENV !== 'production' && error) {
        console.log('Error in forgotPasswordRequest ', error)
      }
      res.status(400).json({ success: false, error })
    }
  },
  updatePassword: async (req, res) => {
    const { newPassword } = req.body
    const { token } = req.params
    try {
      const user = await User.findOne({ resetPassToken: token, resetPassTokenExpireIn: { $gt: Date.now() } })
      if (!user) {
        return res.status(400).json({ success: false, msg: 'Reset token is invalid or expired!' })
      }
      user.password = newPassword
      user.resetPassToken = undefined
      user.resetPassTokenExpireIn = undefined
      await user.save()
      return res.status(204)
    } catch (err) {
      if (process.env.NODE_ENV !== 'production' && err) {
        console.log('Error in updatePassword ', err)
      }
      res.status(400).json({ success: false, err })
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

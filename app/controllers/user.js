const User = require('../models/User')

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
  userProfile: (req, res, next) => {
    res.json({ success: 'ok' })
  },
  userProfileUpdate: (req, res, next) => {
    res.json({ success: 'ok' })
  },
  userDelete: (req, res, next) => {
    res.json({ success: 'ok' })
  }
}

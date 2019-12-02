const User = require('../models/User')

module.exports = {
  authenticateUser: async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    try {
      const user = await User.findByCredentials(email, password)
      const token = await user.generateAuthToken()
      res.send({ user: user, token: token })
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // console.log('error ', error)
      }
      res.status(400).send({ error: error })
    }
  },
  logout: (req, res, next) => {
    res.json({ success: 'ok' })
  },
  logoutAll: (req, res, next) => {
    res.json({ success: 'ok' })
  }
}

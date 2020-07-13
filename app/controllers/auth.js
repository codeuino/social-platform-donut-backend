const User = require('../models/User')
const HttpStatus = require('http-status-codes')
const rateLimiter = require('../utils/rateLimit')
module.exports = {
  authenticateUser: async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    try {
      const _state = await rateLimiter.rateLimit(email, false)
      if (_state === 'admit') {
        const user = await User.findByCredentials(email, password)
        const token = await user.generateAuthToken()
        await rateLimiter.rateLimit(email, true)
        res.send({ user: user, token: token })
      } else {
        res.status(HttpStatus.TOO_MANY_REQUESTS).json({ error: _state })
        if (process.env.NODE_ENV !== 'production') {
          console.log('Error', '-', _state)
        }
      }
      await rateLimiter.rateLimit(email, true)
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(error.name, '-', error.message)
      }
      const _state = await rateLimiter.rateLimit(email, false)
      if (_state === 'admit') {
        res.status(HttpStatus.BAD_REQUEST).json({ error: error.message })
      } else {
        res.status(HttpStatus.TOO_MANY_REQUESTS).json({ error: _state })
        if (process.env.NODE_ENV !== 'production') {
          console.log('Error', '-', _state)
        }
      }
    }
  },
  logout: (req, res, next) => {
    res.status(HttpStatus.OK).json({ success: 'ok' })
  },
  logoutAll: (req, res, next) => {
    res.status(HttpStatus.OK).json({ success: 'ok' })
  }
}

const jwt = require('jsonwebtoken')
const User = require('../models/User')
const HttpStatus = require('http-status-codes')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token
    })

    if (!user) {
      throw new Error()
    } else {
      req.token = token
      req.user = user
      next()
    }
  } catch (error) {
    res.status(HttpStatus.UNAUTHORIZED).send({ error: 'Please authenticate' })
  }
}

module.exports = auth

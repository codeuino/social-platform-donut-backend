const User = require('../models/User')
const HttpStatus = require('http-status-codes')

const isActivated = async (req, res, next) => {
  const { email } = req.body
  try {
    const user = await User.findOne({ email: email })
    if (!user) {
      next(new Error('No such user is found!'))
    }
    if (user && !user.isActivated) {
      next(new Error('Please activate the account!'))
    }
  } catch (Error) {
    return res.status(HttpStatus.BAD_REQUEST).json({ Error })
  }
}

module.exports = isActivated

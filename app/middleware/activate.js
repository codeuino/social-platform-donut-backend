const User = require('../models/User')

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
    return res.status(400).json({ Error })
  }
}

module.exports = isActivated

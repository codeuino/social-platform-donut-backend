const User = require('../models/User')
const HttpStatus = require('http-status-codes')
module.exports = {
  getActivity: async (req, res, next) => {
    const { id } = req.params
    try {
      const user = await User.findById(req.user._id)
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'Invalid request!' })
      }
      // check if not admin
      if (user.isAdmin !== true) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'You don\'t have permission!' })
      }
      // else allowed
      const activityUser = await User.findById(id)
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'No such user exists' })
      }
      res.status(HttpStatus.OK).json({ activity: activityUser.activity })
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(error.name, '-', error.message)
      }
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message })
    }
  }
}

const User = require('../models/User')
const Activity = require('../models/Activity')

const HttpStatus = require('http-status-codes')
module.exports = {

  getActivity: async (req, res, next) => {
    // userID whose activity will be fetched by admin
    const { id } = req.params

    try {
      // Check if user exists
      const user = await User.findById(req.user._id)
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'No such user exists!' })
      }

      // check if not admin
      if (user.isAdmin !== true) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'You don\'t have permission!' })
      }

      const data = await Activity.findOne({ userId: id })
      return res.status(HttpStatus.OK).json({ activity: data.activity })
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(error.name, '-', error.message)
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message })
    }
  }
}

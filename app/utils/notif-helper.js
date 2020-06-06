const User = require('../models/User')
const HANDLER = require('../utils/response-helper')

module.exports = {
  addToNotification: async (req, res, obj, next) => {
    try {
      const user = await User.findById(req.user._id)
      user.notifications.unshift(obj)
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

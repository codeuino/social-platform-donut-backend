const User = require('../models/User')

module.exports = {
  // Notification for Admins
  addToNotificationForAdmin: async (req, res, obj, next) => {
    try {
      console.log('adding to admin\'s notifications')
      await User.updateMany({ isAdmin: true }, { $push: { ticketNotifications: { $each: [obj], $position: 0 } } })
    } catch (error) {
      console.log(error)
    }
  }
}

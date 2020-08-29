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
  },
  addToNotificationForModerator: async (req, res, obj, next) => {
    try {
      console.log('adding to admin\'s notifications')
      await User.updateMany({ isTicketsModerator: true }, { $push: { ticketNotifications: { $each: [obj], $position: 0 } } })
    } catch (error) {
      console.log(error)
    }
  },
  addToNotificationForUser: async (userId, res, obj, next) => {
    try {
      console.log('adding to user\'s notifications')
      const user = await User.findById(userId)
      user.ticketNotifications.unshift(obj)
      await user.save()
    } catch (error) {
      console.log(error)
    }
  }
}

const User = require('../models/User')
const HANDLER = require('../utils/response-helper')
const Notifications = require('../models/Notifications')

module.exports = {
  // Notifications for a user
  addToNotificationForUser: async (userId, res, obj, next) => {
    try {
      // modify req.user._id to userId (TODO)
      console.log('adding to user\'s notifications')
      const user = await User.findById(userId)
      user.notifications.unshift(obj)
      await user.save()
      console.log('user notifications', user.notifications)
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  // Notifications for all
  addToNotificationForAll: async (req, res, obj, next) => {
    const newNotification = new Notifications(obj)
    try {
      await newNotification.save()
      console.log('newNotifications ', newNotification)
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

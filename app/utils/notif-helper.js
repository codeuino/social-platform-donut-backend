const User = require('../models/User')
const Notifications = require('../models/Notifications')

module.exports = {
  // Notifications for a user
  addToNotificationForUser: async (userId, res, obj, next) => {
    try {
      console.log('adding to user\'s notifications')
      const user = await User.findById(userId)
      user.notifications.unshift(obj)
      await user.save()
    } catch (error) {
      console.log(error)
    }
  },
  // Notifications for all
  addToNotificationForAll: async (req, res, obj, next) => {
    const newNotification = new Notifications(obj)
    try {
      await newNotification.save()
      console.log('newNotifications ', newNotification)
    } catch (error) {
      console.log(error)
    }
  }
}

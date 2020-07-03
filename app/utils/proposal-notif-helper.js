const User = require('../models/User')
const ProposalNotification = require('../models/ProposalNotification')

module.exports = {
  // Notifications for a user
  addToNotificationForUser: async (userId, res, obj, next) => {
    try {
      console.log("adding to user's notifications")
      const user = await User.findById(userId)
      user.proposalNotifications.unshift(obj)
      await user.save()
    } catch (error) {
      console.log(error)
    }
  },
  // Notifications for all
  addNotificationForAll: async (req, res, obj, next) => {
    const newNotification = new ProposalNotification(obj)

    try {
      await newNotification.save()
    } catch (error) {
      console.log(error)
    }
  }
}

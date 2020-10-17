const User = require('../models/User')

module.exports = {
  isValidObjectId: (id, res) => {
    return id.match(/^[0-9a-fA-F]{24}$/)
  },
  isCreatorModeratorAdmin: (ticket, user) => {
    return user.id.toString() === ticket.createdBy.id.toString() || user.isAdmin || user.isTicketsModerator
  },
  // Notification for Admins
  addToNotificationForAdmin: async (req, res, obj) => {
    try {
      console.log('adding to admin\'s notifications')
      await User.updateMany({ isAdmin: true }, { $push: { ticketNotifications: { $each: [obj], $position: 0 } } })
    } catch (error) {
      console.log(error)
    }
  },
  addToNotificationForModerator: async (req, notification) => {
    try {
      console.log('adding to admin\'s notifications')
      notification.createdAt = Date.now()
      await User.updateMany({ isTicketsModerator: true }, { $push: { ticketNotifications: { $each: [notification], $position: 0 } } })
      req.io.emit('New Ticket Notification', { ...notification, for: 'moderator' })
    } catch (error) {
      console.log(error)
    }
  },
  addToNotificationForUser: async (userId, req, notification) => {
    try {
      console.log('adding to user\'s notifications')
      notification.createdAt = Date.now()
      const user = await User.findById(userId)
      user.ticketNotifications.unshift(notification)
      await user.save()
      req.io.emit('New Ticket Notification', { ...notification, for: userId })
    } catch (error) {
      console.log(error)
    }
  }
}

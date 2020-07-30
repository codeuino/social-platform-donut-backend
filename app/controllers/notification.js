const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const Notifications = require('../models/Notifications')
const helper = require('../utils/paginate')
const User = require('../models/User')
const ProposalNotifications = require('../models/ProposalNotification')

module.exports = {
  // GET ALL THE NOTIFICATIONS FOR ALL
  getOrgNotifications: async (req, res, next) => {
    try {
      const notifications = await Notifications.find(
        {},
        {},
        helper.paginate(req)
      )
        .lean()
        .sort({ createdAt: -1 })
        .exec()
      return res.status(HttpStatus.OK).json({ notifications })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  // GET LOGGED IN USER NOTIFICATIONS
  getUserNotification: async (req, res, next) => {
    const userId = req.user._id
    try {
      const user = await User.findById(userId)
      if (!user) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ msg: 'No such user exists!' })
      }
      // get all notifications of existing user
      const notifications = user.notifications
      if (notifications.length === 0) {
        return res.status(HttpStatus.OK).json({ msg: 'No new notifications!' })
      }
      return res.status(HttpStatus.OK).json({ notifications })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  getProposalNotifications: async (req, res, next) => {
    try {
      const notifications = await ProposalNotifications.find({})
      return res.status(HttpStatus.OK).json({ notifications })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

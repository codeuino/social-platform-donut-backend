const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const Notifications = require('../models/Notifications')
const helper = require('../utils/paginate')
const User = require('../models/User')
const ProposalNotifications = require('../models/ProposalNotification')

class NotificationProvider {
  constructor(NotificationModel, UserModel, ProposalModel) {
    this.initModels(NotificationModel, UserModel, ProposalModel)
    this.initBinding()
  }

  initModels (NotificationModel, UserModel, ProposalModel) {
    this.UserModel = UserModel
    this.NotificationModel = NotificationModel
    this.ProposalModel = ProposalModel
  }

  initBinding () {
    this.getOrgNotifications = this.getOrgNotifications.bind(this)
    this.getUserNotification = this.getUserNotification.bind(this)
    this.getProposalNotifications = this.getProposalNotifications.bind(this)
  }

  // GET ALL THE NOTIFICATIONS FOR ALL
  async getOrgNotifications(req, res, next) {
    try {
      const notifications = await this.NotificationModel.find(
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
  }

  // GET LOGGED IN USER NOTIFICATIONS
  async getUserNotification(req, res, next) {
    const userId = req.user._id
    try {
      const user = await this.UserModel.findById(userId)
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
  }

  async getProposalNotifications(req, res, next) {
    try {
      const notifications = await this.ProposalModel.find({})
      return res.status(HttpStatus.OK).json({ notifications })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

module.exports = NotificationProvider

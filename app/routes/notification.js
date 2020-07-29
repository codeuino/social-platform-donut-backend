const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const isUnderMaintenance = require('../middleware/maintenance')
const Notifications = require('../models/Notifications')
const User = require('../models/User')
const ProposalNotifications = require('../models/ProposalNotification')
const NotificationClass = require('../controllers/notification')
const notificationController = new NotificationClass(Notifications, User, ProposalNotifications)


// GET NOTIFICATIONS FOR ALL
router.get(
  '/org/all',
  isUnderMaintenance,
  auth,
  notificationController.getOrgNotifications
)

// GET NOTIFICATIONS FOR LOGGED IN USER
router.get(
  '/user/all',
  isUnderMaintenance,
  auth,
  notificationController.getUserNotification
)

// GET NOTICATIONS FOR PROPOSALS
router.get(
  '/proposal/all', 
  isUnderMaintenance,
  auth,
  notificationController.getProposalNotifications
)

module.exports = router

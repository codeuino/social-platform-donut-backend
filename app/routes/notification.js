const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const isUnderMaintenance = require('../middleware/maintenance')
const notificationController = require('../controllers/notification')

// GET NOTIFICATIONS FOR ALL
router.get(
  '/org/all',
  auth,
  notificationController.getOrgNotifications
)

// GET NOTIFICATIONS FOR LOGGED IN USER
router.get(
  '/user/all',
  auth,
  notificationController.getUserNotification
)

// GET NOTICATIONS FOR PROPOSALS
router.get(
  '/proposal/all',
  auth,
  notificationController.getProposalNotifications
)

// GET TICKET NOTIFICATIONS FOR LOGGED IN USER
router.get(
  '/ticket/user/all',
  auth,
  notificationController.getTicketNotifications
)

module.exports = router

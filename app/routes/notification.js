const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const isUnderMaintenance = require('../middleware/maintenance')
const notificationController = require('../controllers/notification')

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
router.get('/proposal/all', notificationController.getProposalNotifications)

module.exports = router

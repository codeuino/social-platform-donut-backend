const express = require('express')
const router = express.Router()

const activityController = require('../controllers/activity')
const isUnderMaintenance = require('../middleware/maintenance')

// get a User activity
router.get(
  '/user/:id/activity',
  isUnderMaintenance,
  activityController.getActivity
)

module.exports = router

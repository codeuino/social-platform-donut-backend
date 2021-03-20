const express = require('express')
const router = express.Router()

const activityController = require('../controllers/activity')
const isUnderMaintenance = require('../middleware/maintenance')
const auth = require('../middleware/auth')

// get a User activity
router.get(
  '/user/:id',
  auth,
  activityController.getActivity
)

module.exports = router

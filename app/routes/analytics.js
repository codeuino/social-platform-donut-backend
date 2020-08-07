const express = require('express')
const router = express.Router()
const analyticsController = require('../controllers/analytics')
const auth = require('../middleware/auth')
const isUnderMaintenance = require('../middleware/maintenance')

// Get Browser analytics
router.post('/browser', isUnderMaintenance, auth, analyticsController.getBrowser)

// Get country analytics
router.post('/countries', isUnderMaintenance, auth, analyticsController.getCountries)

// Get Device analytics
router.post('/device', isUnderMaintenance, auth, analyticsController.getDevice)

// Get most viewed Proposals
router.post('/mostviewed', isUnderMaintenance, auth, analyticsController.getTopProposals)

// Get Views of a specific proposal
router.post('/views', isUnderMaintenance, auth, analyticsController.getProposalViews)

module.exports = router

const express = require('express')
const router = express.Router()
const analyticsController = require('../controllers/analytics')
const auth = require('../middleware/auth')
const isUnderMaintenance = require('../middleware/maintenance')

// Get Browser analytics
router.get('/browser', isUnderMaintenance, auth, analyticsController.getBrowser)

// Get country analytics
router.get('/countries', isUnderMaintenance, auth, analyticsController.getCountries)

// Get Device analytics
router.get('/device', isUnderMaintenance, auth, analyticsController.getDevice)

// Get most viewed Proposals
router.get('/mostviewed', isUnderMaintenance, auth, analyticsController.getTopProposals)

// Get Views of a specific proposal
router.get('/views', isUnderMaintenance, auth, analyticsController.getProposalViews)

module.exports = router

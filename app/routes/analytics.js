const express = require('express')
const router = express.Router()
const analyticsController = require('../controllers/analytics')
const auth = require('../middleware/auth')

// Get Browser analytics
router.get('/browser', auth, analyticsController.getBrowser)

// Get country analytics
router.get('/countries', auth, analyticsController.getCountries)

// Get Device analytics
router.get('/device', auth, analyticsController.getDevice)

// Get most viewed Proposals
router.get('/mostviewed', auth, analyticsController.getTopProposals)

// Get Views of a specific proposal
router.get('/views', auth, analyticsController.getProposalViews)

module.exports = router

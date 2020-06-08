const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const proposalController = require('../controllers/proposal')

// Create a new proposal
router.post('/', auth, proposalController.createProposal)

// Save the content of a proposal
router.patch('/:proposalId', auth, proposalController.saveProposal)

// Attach file to the given proposal
router.post('/attach/:proposalId', auth, proposalController.attachFile)

// Get proposals by userId
router.get('/', auth, proposalController.getByUserId)

// get proposal by proposalId
router.get('/:proposalId', auth, proposalController.getProposalById)

// Deletes a proposal by given proposalId
router.delete('/', auth, proposalController.deleteById)

// Update proposal state
router.patch('/change', auth, proposalController.changeState)

module.exports = router

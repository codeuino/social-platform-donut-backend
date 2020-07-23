const express = require('express')
const router = express.Router()
const proposalController = require('../controllers/proposal')
const activity = require('../middleware/activity')

// Create a new proposal
router.post('/', proposalController.createProposal, activity)

// Save the content of a proposal
router.patch('/:proposalId', proposalController.saveProposal, activity)

// Attach file to the given proposal
router.post('/attach/:proposalId', proposalController.attachFile, activity)

// Get proposals by userId
router.get('/user/:userId', proposalController.getByUserId)

// get proposal by proposalId
router.get('/:proposalId', proposalController.getProposalById)

// Deletes a proposal by given proposalId
router.delete('/', proposalController.deleteById)

// Update proposal state
router.patch('/change/:proposalId', proposalController.changeState, activity)

// Get all the proposals
router.post('/all', proposalController.getAllProposals)

// Comment on the given proposala
router.post('/comment', proposalController.commentOnProposal, activity)

router.post(
  '/notifications',
  proposalController.getProposalNotificationsByUser
)

module.exports = router

const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { isValidObjectId } = require('../utils/utils')
const ticketController = require('../controllers/ticket')
const isUnderMaintenance = require('../middleware/maintenance')

// CREATE A TICKET
router.post('/', isUnderMaintenance, auth, ticketController.create)

// GET TICKETS - ALL OR FILTERED
router.get('/', isUnderMaintenance, auth, ticketController.getTicket)

// GET ALL TICKETS OPENED BY LOGGED IN USER
// router.get('/')

// EDIT A TICKET BY ID
router.put('/:id', isUnderMaintenance, auth, isValidObjectId, ticketController.editTicket)

// EDIT TAG TO A TICKET
// expects an array of tags and replaces the existing tags with that array
router.put('/:id/tag', isUnderMaintenance, auth, isValidObjectId, ticketController.editTag)

// ADD A TAG TO A TICKET
// adds a single tag to ticket
router.post('/:id/tag/:tag', isUnderMaintenance, auth, isValidObjectId, ticketController.addTag)

// REMOVE TAG ON A TICKET
// removes a single tag from a ticket
router.delete('/:id/tag/:tag', isUnderMaintenance, auth, isValidObjectId, ticketController.deleteTag)

// COMMENT ON A TICKET
router.post('/:id/comment', isUnderMaintenance, auth, isValidObjectId, ticketController.createComment)

// GET TICKET COMMENTS BY TICKET ID
router.get('/:id/comments', isUnderMaintenance, auth, isValidObjectId, ticketController.getComments)

// EDIT TICKET COMMENT BY ID
router.put('/:id/comment/:commentID', isUnderMaintenance, auth, isValidObjectId, ticketController.editComment)

// UPVOTE TICKET COMMENT
router.put('/:id/comment/:commentID/upvote', isUnderMaintenance, auth, isValidObjectId, ticketController.upVoteComment)

// DOWNVOTE TICKET COMMENT
router.put('/:id/comment/:commentID/downvote', isUnderMaintenance, auth, isValidObjectId, ticketController.downVoteComment)

// DELETE TICKET COMMENT BY ID
router.delete('/:id/comment/:commentID', isUnderMaintenance, auth, isValidObjectId, ticketController.deleteComment)

// DELETE TICKET BY ID
router.delete('/:id', isUnderMaintenance, auth, isValidObjectId, ticketController.deleteTicket)

module.exports = router
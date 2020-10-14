const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const ticketController = require('../controllers/ticket')
const isUnderMaintenance = require('../middleware/maintenance')

// CREATE A TICKET
router.post(
  '/',
  isUnderMaintenance,
  auth,
  ticketController.create
)

// GET ALL TICKETS (Brief)
router.get(
  '/',
  isUnderMaintenance,
  auth,
  ticketController.getTicket
)

// GET TICKET (ALL DETAILS)
router.get(
  '/:id',
  isUnderMaintenance,
  auth,
  ticketController.getTicketFull
)

// EDIT A TICKET BY ID
router.patch(
  '/:id',
  isUnderMaintenance,
  auth,
  ticketController.editTicket
)

// EDIT TAG TO A TICKET
// expects an array of tags and replaces the existing tags with that array
router.patch(
  '/:id/tag',
  isUnderMaintenance,
  auth,
  ticketController.editTag
)

// ADD A TAG TO A TICKET
// adds a single tag to ticket
router.post(
  '/:id/tag/:tag',
  isUnderMaintenance,
  auth,
  ticketController.addTag
)

// REMOVE TAG ON A TICKET
// removes a single tag from a ticket
router.delete(
  '/:id/tag/:tag',
  isUnderMaintenance,
  auth,
  ticketController.deleteTag
)

// COMMENT ON A TICKET
router.post(
  '/:id/comment',
  isUnderMaintenance,
  auth,
  ticketController.createComment
)

// GET TICKET COMMENTS BY TICKET ID
router.get(
  '/:id/comments',
  isUnderMaintenance,
  auth,
  ticketController.getComments
)

// EDIT TICKET COMMENT BY ID
router.patch(
  '/:id/comment/:commentID',
  isUnderMaintenance,
  auth,
  ticketController.editComment
)

// UPVOTE TICKET COMMENT
router.patch(
  '/:id/comment/:commentID/upvote',
  isUnderMaintenance,
  auth,
  ticketController.upVoteComment
)

// DOWNVOTE TICKET COMMENT
router.patch(
  '/:id/comment/:commentID/downvote',
  isUnderMaintenance,
  auth,
  ticketController.downVoteComment)

// ADD TICKET MODERATOR
router.post(
  '/moderator/:id',
  isUnderMaintenance,
  auth,
  ticketController.addModerator
)

// GET ALL TICKET MODERATORS
router.get(
  '/moderator',
  isUnderMaintenance,
  auth,
  ticketController.getModerators
)

// GET ALL USERS
router.get(
  '/users/all',
  isUnderMaintenance,
  auth,
  ticketController.getUsers
)

// REMOVE TICKET MODERATOR
router.delete(
  '/moderator/:id',
  isUnderMaintenance,
  auth,
  ticketController.removeModerator
)

// DELETE TICKET COMMENT BY ID
router.delete(
  '/:id/comment/:commentID',
  isUnderMaintenance,
  auth,
  ticketController.deleteComment
)

// DELETE TICKET BY ID
router.delete(
  '/:id',
  isUnderMaintenance,
  auth,
  ticketController.deleteTicket
)

module.exports = router

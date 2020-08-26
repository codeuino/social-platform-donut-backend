const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const ticketController = require('../controllers/ticket')
const isUnderMaintenance = require('../middleware/maintenance')

// CREATE A TICKET
router.post('/', isUnderMaintenance, auth, ticketController.create)

// GET TICKETS - ALL OR FILTERED
router.get('/', isUnderMaintenance, auth, ticketController.getTicket)

// GET ALL TICKETS OPENED BY LOGGED IN USER
// router.get('/')

// EDIT A TICKET BY ID
router.put('/:id', isUnderMaintenance, auth, ticketController.editTicket)

// COMMENT ON A TICKET
// router.post('/:id/comment')

// GET TICKET COMMENTS BY TICKET ID
// router.get('/:id/comment')

// EDIT TICKET COMMENT BY ID
// router.put('/:ticketID/comment/:commentID')

// DELETE TICKET BY ID
router.delete('/:id', isUnderMaintenance, auth, ticketController.deleteTicket)

module.exports = router

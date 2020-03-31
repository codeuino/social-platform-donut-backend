const express = require('express')
const router = express.Router()
const eventController = require('../controllers/event')

// CREATE A POST
router.post(
  '/',
  eventController.createEvent
)

router.post(
  '/event_update/:id',
  eventController.updateEvent
)
router.post(
  '/:id/event_rsvp/:event_id',
  eventController.rsvpOfEvent
)
router.get(
  '/geteventbyId/:id',
  eventController.GetEventById
)

router.get(
  '/getallEvent',
  eventController.GetAllEvent
)
router.delete(
  '/deleteEventById/:id',
  eventController.deleteEventById
)
router.delete(
  '/deleteAllEvent',
  eventController.deleteAllEvent
)

module.exports = router

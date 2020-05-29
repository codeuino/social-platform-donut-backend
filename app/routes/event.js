const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()
const eventController = require('../controllers/event')

// get all the events
router.get(
  '/all',
  auth,
  eventController.GetAllEvent
)

// get all the events
router.get(
  '/upcoming',
  auth,
  eventController.UpComingEvents
)

// create an event
router.post(
  '/',
  auth,
  eventController.createEvent
)
// get event by id
router.get(
  '/:id',
  auth,
  eventController.GetEventById
)
// update an event
router.patch(
  '/:id',
  auth,
  eventController.updateEvent
)
// rsvp by user
router.patch(
  '/rsvp/:id',
  auth,
  eventController.rsvp
)
// delete an event
router.delete(
  '/:id',
  auth,
  eventController.deleteEvent
)

module.exports = router

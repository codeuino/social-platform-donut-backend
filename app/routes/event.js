const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()
const eventController = require('../controllers/event')
const isUnderMaintenance = require('../middleware/maintenance')

// get all the events
router.get(
  '/all',
  isUnderMaintenance,
  auth,
  eventController.GetAllEvent
)

// get all the events
router.get(
  '/upcoming',
  isUnderMaintenance,
  auth,
  eventController.UpComingEvents
)

// create an event
router.post(
  '/',
  isUnderMaintenance,
  auth,
  eventController.createEvent
)
// get event by id
router.get(
  '/:id',
  isUnderMaintenance,
  auth,
  eventController.GetEventById
)
// update an event
router.patch(
  '/:id',
  isUnderMaintenance,
  auth,
  eventController.updateEvent
)
// rsvp by user
router.patch(
  '/rsvp/:id',
  isUnderMaintenance,
  auth,
  eventController.rsvp
)
// delete an event
router.delete(
  '/:id',
  isUnderMaintenance,
  auth,
  eventController.deleteEvent
)

// GET ALL EVENT POSTED BY A USER
router.get(
  '/:id/all',
  isUnderMaintenance,
  auth,
  eventController.getAllEventByUser
)

module.exports = router

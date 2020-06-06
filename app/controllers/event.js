const Event = require('../models/Event')
const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
// const notificationHelper = require('../utils/notif-helper')

module.exports = {
  createEvent: async (req, res, next) => {
    const event = new Event(req.body)
    try {
      await event.save()
      req.io.emit('new event created', { data: event.eventName })
      res.status(HttpStatus.CREATED).json({ event: event })
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: error })
    }
  },
  updateEvent: async (req, res) => {
    const { id } = req.params
    const updates = Object.keys(req.body)
    try {
      const event = await Event.findById(id)
      if (!event) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'No post exists' })
      }
      updates.forEach(update => {
        event[update] = req.body[update]
      })
      await event.save()
      req.io.emit('event update', { data: `Event: ${event.eventName} is updated!` })
      res.status(HttpStatus.OK).json({ event: event })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  rsvp: async (req, res) => {
    const { yes, no, maybe } = req.body
    const { id } = req.params
    try {
      const data = await Event.findById(id)
      if (!data) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: 'No Event is available' })
        return
      }
      if (data.rsvpMaybe.includes(req.user.id) ||
      data.rsvpNo.includes(req.user.id) ||
      data.rsvpYes.includes(req.user.id)) {
        req.io.emit('already rsvp', { data: 'You have already done the rsvp' })
        res.status(HttpStatus.OK).json({ msg: 'You have already done the rsvp' })
        return
      }
      const event = await Event.findByIdAndUpdate(id)
      if (yes) {
        try {
          event.rsvpYes.push(req.user.id)
          await event.save()
          req.io.emit('rsvp done', { data: 'RSVP successfully done!' })
          res.status(HttpStatus.OK).json({ rsvpData: data })
        } catch (error) {
          res.status(HttpStatus.BAD_REQUEST).json({ error: error })
        }
      }
      if (no) {
        try {
          event.rsvpNo.push(req.user.id)
          await event.save()
          req.io.emit('rsvp done', { data: 'RSVP successfully done!' })
          res.status(HttpStatus.OK).json({ rsvpData: data })
        } catch (error) {
          res.status(HttpStatus.BAD_REQUEST).json({ error: error })
        }
      }
      if (maybe) {
        try {
          event.rsvpMaybe.push(req.user.id)
          await event.save()
          req.io.emit('rsvp done', { data: 'RSVP successfully done!' })
          res.status(HttpStatus.OK).json({ rsvpData: data })
        } catch (error) {
          res.status(HttpStatus.BAD_REQUEST).json({ error: error })
        }
      }
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  GetEventById: async (req, res, next) => {
    const { id } = req.params
    try {
      const EventData = await Event
        .findById(id)
      if (!EventData) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No such Event is available!' })
      }
      res.status(HttpStatus.OK).json({ Event: EventData })
    } catch (error) {
      next(error)
    }
  },
  GetAllEvent: async (req, res, next) => {
    try {
      const EventData = await Event
        .find()
      if (!EventData) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No such Event is available!' })
      }
      res.status(HttpStatus.OK).json({ Event: EventData })
    } catch (error) {
      next(error)
    }
  },
  deleteEvent: async (req, res, next) => {
    const { id } = req.params
    try {
      const deleteEvent = await Event.findById(id)
      if (!deleteEvent) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'No Event exists' })
      }
      await Event.findByIdAndRemove(id)
      req.io.emit('event deleted', { data: deleteEvent.eventName })
      res.status(HttpStatus.OK).json({ deleteEvent: deleteEvent, message: 'Deleted the event' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

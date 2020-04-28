const Event = require('../models/Event')
const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
module.exports = {
  createEvent: async (req, res, next) => {
    const event = new Event(req.body)
    try {
      await event.save()
      res.status(201).json({ event: event })
    } catch (error) {
      res.status(400).json({ error: error })
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
        res.status(400).json({ error: 'No Event is available' })
        return
      }
      if (data.rsvpMaybe.includes(req.user.id) ||
      data.rsvpNo.includes(req.user.id) ||
      data.rsvpYes.includes(req.user.id)) {
        res.status(201).json({ msg: 'You have already done the rsvp' })
        return
      }
      const event = await Event.findByIdAndUpdate(id)
      if (yes) {
        try {
          event.rsvpYes.push(req.user.id)
          await event.save()
          res.status(201).json({ rsvpData: data })
        } catch (error) {
          res.status(400).json({ error: error })
        }
      }
      if (no) {
        try {
          event.rsvpNo.push(req.user.id)
          await event.save()
          res.status(201).json({ rsvpData: data })
        } catch (error) {
          res.status(400).json({ error: error })
        }
      }
      if (maybe) {
        try {
          event.rsvpMaybe.push(req.user.id)
          await event.save()
          res.status(201).json({ rsvpData: data })
        } catch (error) {
          res.status(400).json({ error: error })
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
        return res.status(400).json({ error: 'No such Event is available!' })
      }
      res.status(201).json({ Event: EventData })
    } catch (error) {
      next(error)
    }
  },
  GetAllEvent: async (req, res, next) => {
    try {
      const EventData = await Event
        .find()
      if (!EventData) {
        return res.status(400).json({ error: 'No such Event is available!' })
      }
      res.status(201).json({ Event: EventData })
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
      res.status(HttpStatus.OK).json({ deleteEvent: deleteEvent, message: 'Deleted the event' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

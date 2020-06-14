const Event = require('../models/Event')
const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const permission = require('../utils/permission')
const helper = require('../utils/paginate')

module.exports = {
  createEvent: async (req, res, next) => {
    const event = new Event(req.body)
    try {
      event.createdBy = req.user._id
      await event.save()
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
      // check for permission (TODO AFTER PREVIOUS PR MERGED)
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
        res.status(HttpStatus.BAD_REQUEST).json({ error: 'No Event is available' })
        return
      }
      if (data.rsvpMaybe.includes(req.user.id) ||
      data.rsvpNo.includes(req.user.id) ||
      data.rsvpYes.includes(req.user.id)) {
        return res.status(HttpStatus.OK).json({ msg: 'You have already done the rsvp' })
      }
      const event = await Event.findByIdAndUpdate(id)
      if (yes) {
        try {
          event.rsvpYes.push(req.user.id)
          await event.save()
          return res.status(HttpStatus.OK).json({ rsvpData: data })
        } catch (error) {
          return res.status(HttpStatus.BAD_REQUEST).json({ error: error })
        }
      }
      if (no) {
        try {
          event.rsvpNo.push(req.user.id)
          await event.save()
          return res.status(HttpStatus.OK).json({ rsvpData: data })
        } catch (error) {
          return res.status(HttpStatus.BAD_REQUEST).json({ error: error })
        }
      }
      if (maybe) {
        try {
          event.rsvpMaybe.push(req.user.id)
          await event.save()
          return res.status(HttpStatus.OK).json({ rsvpData: data })
        } catch (error) {
          return res.status(HttpStatus.BAD_REQUEST).json({ error: error })
        }
      }
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  GetEventById: async (req, res, next) => {
    const { id } = req.params
    try {
      const EventData = await Event.findById(id)
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
      const EventData = await Event.find({}, {}, helper.paginate(req))
        .sort({ eventDate: -1 })
        .lean()
      if (!EventData) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No such Event is available!' })
      }
      return res.status(HttpStatus.OK).json({ Event: EventData })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  deleteEvent: async (req, res, next) => {
    const { id } = req.params
    try {
      const deleteEvent = await Event.findById(id)
      if (!deleteEvent) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'No Event exists' })
      }
      if (permission.check(req, res, deleteEvent.createdBy)) {
        await Event.findByIdAndRemove(id)
        return res.status(HttpStatus.OK).json({ deleteEvent: deleteEvent, message: 'Deleted the event' })
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'Not permitted!' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  UpComingEvents: async (req, res, next) => {
    try {
      const events = await Event.find({ eventDate: { $gt: Date.now() } }, {}, helper.paginate(req))
        .sort({ eventDate: -1 })
        .exec()
      console.log('Upcoming events ', events)
      if (events.length === 0) {
        return res.status(HttpStatus.OK).json({ msg: 'No Upcoming events exists!' })
      }
      return res.status(HttpStatus.OK).json({ events })
    } catch (error) {
      HANDLER.handleError(res, next)
    }
  },

  getAllEventByUser: async (req, res, next) => {
    try {
      const events = await Event.find({ createdBy: req.user._id }, {}, helper.paginate(req))
        .sort({ eventDate: -1 })
        .populate('createdBy', '_id name.firstName name.lastName')
        .exec()
      if (events.length === 0) {
        return res.status(HttpStatus.OK).json({ msg: 'No events posted by user!' })
      }
      return res.status(HttpStatus.OK).json({ events })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

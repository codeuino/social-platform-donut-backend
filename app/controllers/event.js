const Event = require('../models/Event')
const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const permission = require('../utils/permission')
const helper = require('../utils/paginate')
const notificationHelper = require('../utils/notif-helper')
const settingsHelper = require('../utils/settingHelpers')
const notification = {
  heading: '',
  content: '',
  tag: ''
}

module.exports = {
  createEvent: async (req, res, next) => {
    const event = new Event(req.body)
    try {
      event.createdBy = req.user._id
      await event.save()
      req.io.emit('new event created', { data: event.eventName })
      notification.heading = 'New Event!'
      notification.content = `${event.eventName} is added!`
      notification.tag = 'New!'
      notificationHelper.addToNotificationForAll(req, res, notification, next)
      res.status(HttpStatus.CREATED).json({ event: event })
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: error })
    }
  },

  updateEvent: async (req, res, next) => {
    const { id } = req.params
    const updates = Object.keys(req.body)
    try {
      const event = await Event.findById(id)
      if (!event) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'No post exists' })
      }
      // check for permission and edit permission
      if (!permission.check(req, res, event.createdBy) || (!settingsHelper.canEdit())) {
        return res.status(HttpStatus.FORBIDDEN).json({ msg: 'Bad update request' })
      }
      // if edit allowed check allowed limit time
      if (!settingsHelper.isEditAllowedNow(event.createdAt)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'Edit limit expired!' })
      }
      updates.forEach((update) => {
        event[update] = req.body[update]
      })
      await event.save()
      req.io.emit('event update', { data: `Event: ${event.eventName} is updated!` })
      notification.heading = 'Event update!'
      notification.content = `${event.eventName} is updated!`
      notification.tag = 'Update'
      notificationHelper.addToNotificationForAll(req, res, notification, next)
      res.status(HttpStatus.OK).json({ event: event })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  rsvp: async (req, res, next) => {
    const { yes, no, maybe } = req.body
    const { id } = req.params
    notification.tag = 'RSVP'
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
        notification.heading = 'Already rsvp!'
        notification.content = 'You have already done the rsvp'
        notificationHelper.addToNotificationForUser(req.user._id, res, notification, next)
        res.status(HttpStatus.OK).json({ msg: 'You have already done the rsvp' })
        return
      }
      const event = await Event.findByIdAndUpdate(id)
      if (yes) {
        try {
          event.rsvpYes.push(req.user.id)
          await event.save()
          req.io.emit('rsvp done', { data: 'RSVP successfully done!' })
          notification.heading = 'RSVP done!'
          notification.content = 'RSVP successfully done!'
          notificationHelper.addToNotificationForUser(req.user._id, res, notification, next)
          res.status(HttpStatus.OK).json({ rsvpData: data })
        } catch (error) {
          return res.status(HttpStatus.BAD_REQUEST).json({ error: error })
        }
      }
      if (no) {
        try {
          event.rsvpNo.push(req.user.id)
          await event.save()
          req.io.emit('rsvp done', { data: 'RSVP successfully done!' })
          notification.heading = 'RSVP done!'
          notification.content = 'RSVP successfully done!'
          notificationHelper.addToNotificationForUser(req.user._id, res, notification, next)
          res.status(HttpStatus.OK).json({ rsvpData: data })
        } catch (error) {
          return res.status(HttpStatus.BAD_REQUEST).json({ error: error })
        }
      }
      if (maybe) {
        try {
          event.rsvpMaybe.push(req.user.id)
          await event.save()
          req.io.emit('rsvp done', { data: 'RSVP successfully done!' })
          notification.heading = 'RSVP done!'
          notification.content = 'RSVP successfully done!'
          notificationHelper.addToNotificationForUser(req.user._id, res, notification, next)
          res.status(HttpStatus.OK).json({ rsvpData: data })
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
      return res.status(HttpStatus.OK).json({ event: EventData })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  GetAllEvent: async (req, res, next) => {
    try {
      const EventData = await Event.find({}, {}, helper.paginate(req))
        .populate('createdBy', ['name.firstName', 'name.lastName', '_id', 'isAdmin'])
        .sort({ eventDate: -1 })
        .lean()
      return res.status(HttpStatus.OK).json({ events: EventData })
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
        req.io.emit('event deleted', { data: deleteEvent.eventName })
        notification.heading = 'Event deleted!'
        notification.content = `Event ${deleteEvent.eventName} is deleted!`
        notification.tag = 'Deleted'
        notificationHelper.addToNotificationForAll(req, res, notification, next)
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
      return res.status(HttpStatus.OK).json({ events })
    } catch (error) {
      HANDLER.handleError(res, next)
    }
  },

  getAllEventByUser: async (req, res, next) => {
    try {
      const { id } = req.params
      const events = await Event.find({ createdBy: id }, {}, helper.paginate(req))
        .sort({ eventDate: -1 })
        .populate('createdBy', '_id name.firstName name.lastName')
        .exec()
      return res.status(HttpStatus.OK).json({ events })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

const Event = require('../models/Event')
const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const permission = require('../utils/permission')
const helper = require('../utils/paginate')
const notificationHelper = require('../utils/notif-helper')
const settingsHelper = require('../utils/settingHelpers')
const Notification = require('../utils/notificationClass')
const TAGS = require('../utils/notificationTags')

class EventClass extends Notification {
  constructor (eventModel) {
    super()
    this.#initDB(eventModel)
    this.#initBinding()
  }
  //  (PRIVATE) ES6
  #initDB = (eventModel) => {
    this.EventModel = eventModel
  }

  //  (PRIVATE) ES6
  #initBinding = () => {
    this.createEvent = this.createEvent.bind(this)
    this.updateEvent = this.updateEvent.bind(this)
    this.deleteEvent = this.deleteEvent.bind(this)
    this.GetAllEvent = this.GetAllEvent.bind(this)
    this.GetEventById = this.GetEventById.bind(this)
    this.getAllEventByUser = this.getAllEventByUser.bind(this)
    this.rsvp = this.rsvp.bind(this)
    this.UpComingEvents = this.UpComingEvents.bind(this)
  }

  async createEvent (req, res, next) {
    const event = new this.EventModel(req.body)
    try {
      event.createdBy = req.user._id
      await event.save()
      req.io.emit('new event created', { data: event.eventName })
      const newNotif = this.pushNotification(
        'New Event!',
        `${event.eventName} is added!`,
        TAGS.NEW
      )
      notificationHelper.addToNotificationForAll(req, res, newNotif, next)
      res.status(HttpStatus.CREATED).json({ event: event })
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: error })
    }
  }

  async updateEvent (req, res, next) {
    const { id } = req.params
    const updates = Object.keys(req.body)
    try {
      const event = await this.EventModel.findById(id)
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
      const newNotif = this.pushNotification(
        'Event update!',
        `${event.eventName} is updated!`,
        TAGS.UPDATE
      )
      notificationHelper.addToNotificationForAll(req, res, newNotif, next)
      res.status(HttpStatus.OK).json({ event: event })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  async rsvp (req, res, next) {
    const { yes, no, maybe } = req.body
    const { id } = req.params
    try {
      const data = await this.EventModel.findById(id)
      if (!data) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: 'No Event is available' })
        return
      }
      if (data.rsvpMaybe.includes(req.user.id) ||
      data.rsvpNo.includes(req.user.id) ||
      data.rsvpYes.includes(req.user.id)) {
        req.io.emit('already rsvp', { data: 'You have already done the rsvp' })
        const newNotif = this.pushNotification(
          'Already rsvp!',
          'You have already done the rsvp',
          TAGS.RSVP
        )
        notificationHelper.addToNotificationForUser(req.user._id, res, newNotif, next)
        res.status(HttpStatus.OK).json({ msg: 'You have already done the rsvp' })
        return
      }
      const event = await this.EventModel.findByIdAndUpdate(id)
      const newNotif = this.pushNotification(
        'RSVP done!',
        'RSVP successfully done!',
        TAGS.RSVP
      )
      if (yes) {
        try {
          event.rsvpYes.push(req.user.id)
          await event.save()
          req.io.emit('rsvp done', { data: 'RSVP successfully done!' })
          notificationHelper.addToNotificationForUser(req.user._id, res, newNotif, next)
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
          notificationHelper.addToNotificationForUser(req.user._id, res, newNotif, next)
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
          notificationHelper.addToNotificationForUser(req.user._id, res, newNotif, next)
          res.status(HttpStatus.OK).json({ rsvpData: data })
        } catch (error) {
          return res.status(HttpStatus.BAD_REQUEST).json({ error: error })
        }
      }
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  async GetEventById (req, res, next) {
    const { id } = req.params
    try {
      const EventData = await this.EventModel.findById(id)
      if (!EventData) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No such Event is available!' })
      }
      return res.status(HttpStatus.OK).json({ event: EventData })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  async GetAllEvent (req, res, next) {
    try {
      const EventData = await this.EventModel.find({}, {}, helper.paginate(req))
        .populate('createdBy', ['name.firstName', 'name.lastName', '_id', 'isAdmin'])
        .sort({ eventDate: -1 })
        .lean()
      return res.status(HttpStatus.OK).json({ events: EventData })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  async deleteEvent (req, res, next) {
    const { id } = req.params
    try {
      const deleteEvent = await this.EventModel.findById(id)
      if (!deleteEvent) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'No Event exists' })
      }
      if (permission.check(req, res, deleteEvent.createdBy)) {
        await Event.findByIdAndRemove(id)
        req.io.emit('event deleted', { data: deleteEvent.eventName })
        const newNotif = this.pushNotification(
          'Event deleted!',
          `Event ${deleteEvent.eventName} is deleted!`,
          TAGS.DELETE
        )
        notificationHelper.addToNotificationForAll(req, res, newNotif, next)
        return res.status(HttpStatus.OK).json({ deleteEvent: deleteEvent, message: 'Deleted the event' })
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'Not permitted!' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  async UpComingEvents (req, res, next) {
    try {
      const events = await this.EventModel.find({
        eventDate: {
          $gt: Date.now()
        }
      }, {}, helper.paginate(req))
        .sort({ eventDate: -1 })
        .exec()
      return res.status(HttpStatus.OK).json({ events })
    } catch (error) {
      HANDLER.handleError(res, next)
    }
  }

  async getAllEventByUser (req, res, next) {
    try {
      const events = await this.EventModel.find({ createdBy: req.user._id }, {}, helper.paginate(req))
        .sort({ eventDate: -1 })
        .populate('createdBy', '_id name.firstName name.lastName')
        .exec()
      return res.status(HttpStatus.OK).json({ events })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

module.exports = EventClass

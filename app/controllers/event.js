const Event = require('../models/Event')
module.exports = {
  createEvent: async (req, res, next) => {
    const event = new Event(req.body)
    try {
      await event.save()
      res.status(201).json({ event: event })
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error })
    }
  },
  updateEvent: async (req, res) => {
    Event.findById(req.params.id, (err, data) => {
      if (err) {
        throw err
      } else {
        Event.findByIdAndUpdate(req.params.id, {
          eventName: data.eventName,
          description: data.description,
          slots: data.slots,
          location: data.location,
          eventDate: data.eventDate,
          createdAt: data.createdAt,
          isOnline: data.isOnline,
          updatedAt: Date.now()
        }, function (err, updatedEvent) {
          if (err) {
            throw err
          } else {
            res.json({ updatedEvent: updatedEvent })
          }
        })
      }
    })
  },
  rsvpOfEvent: async (req, res) => {
    const { yes, no, maybe } = req.body
    Event.findById(req.params.event_id, function (error, data) {
      if (error) {
        res.status(201).json({ error: error })
      }

      if (data.rsvp_maybe.includes(req.params.id) ||
      data.rsvp_no.includes(req.params.id) ||
      data.rsvp_yes.includes(req.params.id)) {
        res.status(201).json({ msg: 'You have already done the rsvp' })
      }
      if (yes) {
        Event.findByIdAndUpdate(req.params.event_id, {
          $push: {
            rsvp_yes: req.params.id
          }
        },
        function (error, data) {
          if (error) {
            res.status(201).json({ error: error })
          }
          res.status(400).json({ updatedData: data })
        })
      }
      if (no) {
        Event.findByIdAndUpdate(req.params.event_id, {
          $push: {
            rsvp_no: req.params.id
          }
        },
        function (error, data) {
          if (error) {
            res.status(201).json({ error: error })
          }
          res.status(400).json({ updatedData: data })
        })
      }
      if (maybe) {
        Event.findByIdAndUpdate(req.params.event_id, {
          $push: {
            rsvp_maybe: req.params.id
          }
        }, function (error, data) {
          if (error) {
            res.status(201).json({ error: error })
          }
          res.status(400).json({ updatedData: data })
        })
      }
    }
    )
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
  deleteEventById: async (req, res, next) => {
    const { id } = req.params
    try {
      const event = await Event.findByIdAndRemove(id)
      if (!event) {
        return res.status(400).json({ error: 'No such Event exists!' })
      }
      res.status(201).json({ DeletedEvent: event })
    } catch (error) {
      next(error)
    }
  },
  deleteAllEvent: async (req, res, next) => {
    try {
      const event = await Event.remove({})
      if (!event) {
        return res.status(400).json({ error: 'Cannot Delete whole list!' })
      }
      res.status(201).json({ DeletedEvent: event })
    } catch (error) {
      next(error)
    }
  }
}

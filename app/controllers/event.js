const Event = require('../models/Event')
module.exports = {
  createEvent: async (req, res, next) => {
    const event = new Event(req.body)
    try {
      await event.save()
      res.status(201).json({ event: event })
    } catch (error) {
      res.status(400).json({ error: error.errors })
    }
  },
  updateEvent: async (req, res) => {
    Event.findById(req.params.id, (err) => {
      if (err) {
        res.status(400).json({ error: 'Did not find an event!' })
      } else {
        Event.findByIdAndUpdate(req.params.id, req.body, function (err, updatedEvent) {
          if (err) {
            res.status(400).json({ error: 'Cannot Update the data' })
          } else {
            res.status(201).json({ updatedEvent: updatedEvent })
          }
        })
      }
    })
  },
  rsvp: async (req, res) => {
    const { yes, no, maybe } = req.body
    Event.findById(req.params.id, function (error, data) {
      if (error) {
        res.status(400).json({ error: error })
      }
      if (data == null) {
        res.status(400).json({ error: 'No Event is available' })
      }

      if (data.rsvpMaybe.includes(req.user.id) ||
      data.rsvpNo.includes(req.user.id) ||
      data.rsvpYes.includes(req.user.id)) {
        res.status(201).json({ msg: 'You have already done the rsvp' })
        return
      }
      if (yes) {
        Event.findByIdAndUpdate(req.params.id, {
          $push: {
            rsvpYes: req.user.id
          }
        },
        function (error, data) {
          if (error) {
            res.status(400).json({ error: error })
          }
          res.status(201).json({ rsvpData: data })
        })
      }
      if (no) {
        Event.findByIdAndUpdate(req.params.id, {
          $push: {
            rsvpNo: req.user.id
          }
        },
        function (error, data) {
          if (error) {
            res.status(400).json({ error: error })
          }
          res.status(201).json({ rsvpData: data })
        })
      }
      if (maybe) {
        Event.findByIdAndUpdate(req.params.id, {
          $push: {
            rsvpMaybe: req.user.id
          }
        }, function (error, data) {
          if (error) {
            res.status(400).json({ error: error })
          }
          res.status(201).json({ rsvpData: data })
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
  deleteEvent: async (req, res, next) => {
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
  }
}

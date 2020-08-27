const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const TicketModel = require('../models/Ticket')
const Ticket = require('../models/Ticket')

module.exports = {
  create: async (req, res, next) => {
    const userId = req.user.id.toString()
    try {
      const ticket = new TicketModel(req.body)
      ticket.createdBy = userId
      await ticket.save()
      res.status(HttpStatus.CREATED).json({
        ticket: ticket
      })
    } catch (error) {
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },
  getTicket: async (req, res, next) => {
    const { user } = req.query
    try {
      let tickets
      if (user === 'me') {
        const userId = req.user.id.toString()
        tickets = await TicketModel.find({ createdBy: userId }).lean().exec()
      } else {
        tickets = await TicketModel.find({}).lean().exec()
      }
      res.status(HttpStatus.OK).json({ tickets: tickets })
    } catch (error) {
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },
  editTicket: async (req, res, next) => {
    const { id } = req.params
    const { title, content } = req.body
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      if (userId !== ticket.createdBy && !req.user.isAdmin) {
        // Only user who created the ticket and admin can edit the ticket
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Edit Forbidden by user' })
      }
      ticket.title = title
      if (content.shortDescription) {
        ticket.content.shortDescription = content.shortDescription
      }
      if (content.longDescription) {
        ticket.content.longDescription = content.longDescription
      }
      await ticket.save()
      res.status(HttpStatus.OK).json({
        ticket: ticket
      })
    } catch (error) {
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },
  deleteTicket: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      if (userId !== ticket.createdBy && !req.user.isAdmin) {
        // Only user who created the ticket and admin can delete the ticket
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Bad delete request' })
      }
      await TicketModel.findByIdAndRemove(id)
      res.status(HttpStatus.OK).json({ ticket: ticket })
    } catch (error) {
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },
  editTag: async (req, res, next) => {
    const { id } = req.params
    const { tags } = req.body // tags is the array of tags to add
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      if (userId !== ticket.createdBy && !req.user.isAdmin) {
        // Only user who created the ticket and admin can edit ticket tags
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Edit Forbidden by user' })
      }
      ticket.tags = [...new Set(tags)]
      await ticket.save()
      res.status(HttpStatus.OK).json({ ticket: ticket })
    } catch (error) {
      console.log(error)
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },
  addTag: async (req, res, next) => {
    const { id, tag } = req.params
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      if (userId !== ticket.createdBy && !req.user.isAdmin) {
        // Only user who created the ticket and admin can add tag to the ticket
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Edit Forbidden by user' })
      }
      ticket.tags.addToSet(tag)
      await ticket.save()
      res.status(HttpStatus.OK).json({ ticket: ticket })
    } catch (error) {
      console.log(error)
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },
  deleteTag: async (req, res, next) => {
    const { id, tag } = req.params
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      if (userId !== ticket.createdBy && !req.user.isAdmin) {
        // Only user who created the ticket and admin can delete tag from a ticket
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Edit Forbidden by user' })
      }
      if (ticket.tags.indexOf(tag) === -1) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Tag not found on ticket' })
      }
      const tags = ticket.tags
      ticket.tags = [...tags.filter(ele => !(ele === tag))]
      await ticket.save()
      res.status(HttpStatus.OK).json({ ticket: ticket })
    } catch (error) {
      console.log(error)
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  }
}

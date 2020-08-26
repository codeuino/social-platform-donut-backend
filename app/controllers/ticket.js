const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const TicketModel = require('../models/Ticket')

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
      HANDLER.handleError(res, error)
    }
    console.log(userId)
    console.log('Create called')
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
      HANDLER.handleError(res, error)
    }
  },
  editTicket: async (req, res, next) => {
    const { title, content } = req.body
    const { id } = req.params
    const userId = req.user.id.toString()
    console.log(req.user)
    try {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid ticket id' })
      }
      const ticket = await TicketModel.findById(id)
      console.log(ticket)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      if (userId !== ticket.createdBy && !req.user.isAdmin) {
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
      HANDLER.handleError(res, error)
    }
  },
  deleteTicket: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid ticket id' })
      }
      const ticket = await TicketModel.findById(id)
      console.log(ticket)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      if (userId !== ticket.createdBy && !req.user.isAdmin) {
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Bad delete request' })
      }
      await TicketModel.findByIdAndRemove(id)
      res.status(HttpStatus.OK).json({ ticket: ticket })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

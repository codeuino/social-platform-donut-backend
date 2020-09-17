const UserModel = require('../models/User')
const HttpStatus = require('http-status-codes')
const TicketModel = require('../models/Ticket')
const TAGS = require('../utils/notificationTags')
const HANDLER = require('../utils/response-helper')
const ticketNotificationHelper = require('../utils/ticket-notif-helper')

const notification = {
  heading: '',
  content: '',
  tag: ''
}

module.exports = {

  create: async (req, res, next) => {
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    const userId = req.user.id.toString()
    try {
      const allTickets = (await TicketModel.find({}))
      const ticket = new TicketModel(req.body)
      ticket.createdBy = {
        id: userId,
        name: `${req.user.name.firstName} ${req.user.name.lastName}`,
        eaill: req.user.email,
        shortDescription: req.user.info.about.shortDescription,
        designation: req.user.info.about.designation,
        location: req.user.info.about.location
      }
      ticket.number = allTickets.length ? (allTickets[allTickets.length - 1].number + 1) : 1
      ticket.createdAt = Date.now()
      ticket.updatedAt = Date.now()
      notification.heading = 'New Support Ticket!'
      notification.content = `${req.user.name.firstName} ${req.user.name.lastName} Creted a new Support Ticket!`
      notification.tag = TAGS.NEW
      notification.createdAt = Date.now()
      await ticketNotificationHelper.addToNotificationForModerator(req, res, notification, next)
      await ticket.save()
      req.io.emit('New Ticket Notification', { ...notification, for: 'moderator' })
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
        console.log(userId)
        console.log(`${req.user.name.firstName} ${req.user.name.lastName}`)
        tickets = await TicketModel.find({ 'createdBy.id': userId }).lean().select('shortDescription number createdAt createdBy status title shortDescription comments tags').exec()
      } else {
        tickets = await TicketModel.find({}).lean().select('shortDescription number createdAt createdBy status title comments tags').exec()
      }
      tickets.forEach(ticket => {
        ticket.comments = ticket.comments.length
        ticket.createdBy = {
          id: ticket.createdBy.id,
          name: ticket.createdBy.name
        }
      })
      res.status(HttpStatus.OK).json({ tickets: tickets })
    } catch (error) {
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },

  getTicketFull: async (req, res, next) => {
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    const { id } = req.params
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
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

  editTicket: async (req, res, next) => {
    const { id } = req.params
    const { type } = req.body
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    // const allowedUpdates = ['title', 'shortDescription', 'content', 'status']
    // const updates = Object.keys(req.body)
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      if (userId !== ticket.createdBy.id.toString() && !req.user.isAdmin && !req.user.isTicketsModerator) {
        // Only user who created the ticket and admin can edit the ticket
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Edit Forbidden by user' })
      }
      const historyItem = {}
      if (type === 'content') {
        ticket.content = req.body.content
        historyItem.content = req.body.content
      } else if (type === 'shortDescription') {
        ticket.shortDescription = req.body.shortDescription
        historyItem.shortDescription = req.body.shortDescription
      } else if (type === 'title') {
        historyItem.title = { old: ticket.title, new: req.body.title }
        ticket.title = req.body.title
      } else if (type === 'status') {
        historyItem.status = req.body.status
        ticket.status = req.body.status
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid edit type' })
      }
      historyItem.type = type
      historyItem.updatedBy = { userId, name: `${req.user.name.firstName} ${req.user.name.lastName}` }
      historyItem.updatedAt = Date.now()
      ticket.history.unshift(historyItem)
      ticket.updatedAt = Date.now()
      await ticket.save()
      res.status(HttpStatus.OK).json({
        ticket: ticket
      })
    } catch (error) {
      console.log(error)
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },

  deleteTicket: async (req, res, next) => {
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      if (userId !== ticket.createdBy.id.toString() && !req.user.isAdmin && !req.user.isTicketsModerator) {
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
      if (userId !== ticket.createdBy.id.toString() && !req.user.isAdmin && !req.user.isTicketsModerator) {
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
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    const { id, tag } = req.params
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      if (userId !== ticket.createdBy.id.toString() && !req.user.isAdmin && !req.user.isTicketsModerator) {
        // Only user who created the ticket and admin can add tag to the ticket
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Edit Forbidden by user' })
      }
      ticket.tags.addToSet(tag)
      const historyItem = { type: 'add tag', tag: tag }
      historyItem.updatedBy = { userId, name: `${req.user.name.firstName} ${req.user.name.lastName}` }
      historyItem.updatedAt = Date.now()
      ticket.history.unshift(historyItem)
      ticket.updatedAt = Date.now()
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

  // Create Comment of a Ticket
  createComment: async (req, res, next) => {
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      ticket.comments.push({
        ...req.body,
        createdBy: {
          userId,
          eaill: req.user.email,
          name: `${req.user.name.firstName} ${req.user.name.lastName}`,
          shortDescription: req.user.info.about.shortDescription,
          designation: req.user.info.about.designation,
          location: req.user.info.about.location
        }
      })
      notification.heading = 'New Comment on Ticket!'
      notification.content = `${req.user.name.firstName} ${req.user.name.lastName} commented on your Ticket!`
      notification.tag = TAGS.NEW
      notification.createdAt = Date.now()
      await ticketNotificationHelper.addToNotificationForUser(ticket.createdBy.id, res, notification, next)
      await ticket.save()
      req.io.emit('New Ticket Notification', { ...notification, for: ticket.createdBy.id })
      res.status(HttpStatus.OK).json({ ticket: ticket })
    } catch (error) {
      console.log(error)
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },

  // Get Comments on a Ticket
  getComments: async (req, res, next) => {
    const { id } = req.params
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      res.status(HttpStatus.OK).json({ comments: ticket.comments })
    } catch (error) {
      console.log(error)
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },

  editComment: async (req, res, next) => {
    const { id, commentID } = req.params
    const { content } = req.body
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      const comment = ticket.comments.id(commentID)
      if (userId !== comment.createdBy.userId && !req.user.isAdmin && !req.user.isTicketsModerator) {
        // Only user who created the comment and admin can edit the comment
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Edit Forbidden by user' })
      }
      comment.content = content
      comment.updatedAt = Date.now()
      await ticket.save()
      res.status(HttpStatus.OK).json({ comment: comment })
    } catch (error) {
      console.log(error)
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },

  upVoteComment: async (req, res, next) => {
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    const { id, commentID } = req.params
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      const comment = ticket.comments.id(commentID)
      if (!comment) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No comment exist' })
      }
      // CHECKS IF THE USER HAS ALREADY UPVOTED THE COMMENT
      if (!comment.votes.upVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          comment.votes.upVotes.user.remove(user)
          return true
        }
      }).length) {
        comment.votes.upVotes.user.unshift(userId)
        // CHECKS IF THE USER HAS ALREADY DOWNVOTED THE COMMENT
        comment.votes.downVotes.user.filter(user => {
          if (JSON.stringify(user) === JSON.stringify(userId)) {
            comment.votes.downVotes.user.remove(user)
          }
        })
      }
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

  downVoteComment: async (req, res, next) => {
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    const { id, commentID } = req.params
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      const comment = ticket.comments.id(commentID)
      if (!comment) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No comment exist' })
      }
      // CHECKS IF THE USER HAS ALREADY DOWNVOTED THE COMMENT
      if (!comment.votes.downVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          comment.votes.downVotes.user.remove(user)
          return true
        }
      }).length) {
        comment.votes.downVotes.user.unshift(userId)
        // CHECKS IF THE USER HAS ALREADY UPVOTED THE COMMENT
        comment.votes.upVotes.user.filter(user => {
          if (JSON.stringify(user) === JSON.stringify(userId)) {
            comment.votes.upVotes.user.remove(user)
          }
        })
      }
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

  deleteComment: async (req, res, next) => {
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    const { id, commentID } = req.params
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      const comment = ticket.comments.id(commentID)
      if (userId !== comment.createdBy.userId && !req.user.isAdmin && !req.user.isTicketsModerator) {
        // Only user who created the comment and admin can edit the comment
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Edit Forbidden by user' })
      }
      comment.remove()
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

  getUsers: async (req, res, next) => {
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    try {
      const users = await UserModel.find({isAdmin: false}).lean().select('name email info isTicketsModerator').exec()
      return res.status(HttpStatus.OK).json({ users: users })
    } catch (error) {
      console.log(error)
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },

  getModerators: async (req, res, next) => {
    try {
      const users = await UserModel.find({isAdmin: false}).lean().select('name email info isTicketsModerator').exec()
      return res.status(HttpStatus.OK).json({ users: users })
    } catch (error) {
      console.log(error)
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },

  addModerator: async (req, res, next) => {
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    // return res.status(HttpStatus.BAD_REQUEST).json({ error: 'No ticket exist' })
    // id of User to add as moderator
    const { id } = req.params
    try {
      if (!req.user.isAdmin) {
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Only Admin user can add moderator' })
      }
      const user = await UserModel.findById(id)
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No user exist' })
      }
      user.isTicketsModerator = true
      await user.save()
      const users = await UserModel.find({isAdmin: false}).lean().select('name email info isTicketsModerator').exec()
      return res.status(HttpStatus.OK).json({ users: users })
    } catch (error) {
      console.log(error)
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },

  removeModerator: async (req, res, next) => {
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    // return res.status(HttpStatus.BAD_REQUEST).json({ error: 'No ticket exist' })
    // id of User to add as moderator
    const { id } = req.params
    try {
      if (!req.user.isAdmin) {
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Only Admin user can remove moderator' })
      }
      const user = await UserModel.findById(id)
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No user exist' })
      }
      user.isTicketsModerator = false
      await user.save()
      const users = await UserModel.find({isAdmin: false}).lean().select('name email info isTicketsModerator').exec()
      return res.status(HttpStatus.OK).json({ users: users })
    } catch (error) {
      console.log(error)
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },

  deleteTag: async (req, res, next) => {
    await (new Promise(resolve => setTimeout(resolve, 2000)))
    const { id, tag } = req.params
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      if (userId !== ticket.createdBy.id.toString() && !req.user.isAdmin && !req.user.isTicketsModerator) {
        // Only user who created the ticket and admin can delete tag from a ticket
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Edit Forbidden by user' })
      }
      if (ticket.tags.indexOf(tag) === -1) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Tag not found on ticket' })
      }
      const tags = ticket.tags
      ticket.tags = [...tags.filter(ele => !(ele === tag))]
      const historyItem = { type: 'remove tag', tag: tag }
      historyItem.updatedBy = { userId, name: `${req.user.name.firstName} ${req.user.name.lastName}` }
      historyItem.updatedAt = Date.now()
      ticket.history.unshift(historyItem)
      ticket.updatedAt = Date.now()
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

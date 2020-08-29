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
    const userId = req.user.id.toString()
    try {
      const ticket = new TicketModel(req.body)
      ticket.createdBy = userId
      ticket.history.push({ ...req.body, editedBy: userId })
      notification.heading = 'New Support Ticket!'
      notification.content = `${req.user.name.firstName} ${req.user.name.lastName} Creted a new Support Ticket!`
      notification.tag = TAGS.NEW
      await ticketNotificationHelper.addToNotificationForModerator(req, res, notification, next)
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
      if (userId !== ticket.createdBy && !req.user.isAdmin && !req.user.isTicketsModerator) {
        // Only user who created the ticket and admin can edit the ticket
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Edit Forbidden by user' })
      }
      if (ticket.title === title &&
        ticket.content.shortDescription === content.shortDescription &&
        ticket.content.longDescription === content.longDescription &&
        ticket.status === content.status) {
        return res.status(HttpStatus.NOT_MODIFIED).json({ error: 'No changes to ticket' })
      }
      ticket.title = title
      ticket.content.shortDescription = content.shortDescription
      ticket.content.longDescription = content.longDescription
      ticket.history.push({ title, content, editedBy: userId, editedAt: Date.now() })
      ticket.updatedAt = Date.now()
      if (content.status) {
        ticket.status = content.status
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
      if (userId !== ticket.createdBy && !req.user.isAdmin && !req.user.isTicketsModerator) {
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
      if (userId !== ticket.createdBy && !req.user.isAdmin && !req.user.isTicketsModerator) {
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
      if (userId !== ticket.createdBy && !req.user.isAdmin && !req.user.isTicketsModerator) {
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

  // Create Comment of a Ticket
  createComment: async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      ticket.comments.push({
        ...req.body,
        userId,
        postId: id
      })
      notification.heading = 'New Comment on Ticket!'
      notification.content = `${req.user.name.firstName} ${req.user.name.lastName} commented on your Ticket!`
      notification.tag = TAGS.NEW
      await ticketNotificationHelper.addToNotificationForUser(ticket.createdBy, res, notification, next)
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
      if (userId !== comment.createdBy && !req.user.isAdmin && !req.user.isTicketsModerator) {
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
      comment.votes.upVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          const error = new Error()
          error.message = 'Bad request - User has already upvoted'
          error.code = HttpStatus.BAD_REQUEST
          throw error
        }
      })
      // CHECKS IF THE USER HAS ALREADY DOWNVOTED THE COMMENT
      comment.votes.downVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          comment.votes.downVotes.user.remove(user)
        }
      })
      comment.votes.upVotes.user.unshift(userId)
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

  downVoteComment: async (req, res, next) => {
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
      comment.votes.downVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          const error = new Error()
          error.message = 'Bad request - User has already downvoted'
          error.code = HttpStatus.BAD_REQUEST
          throw error
        }
      })
      // CHECKS IF THE USER HAS ALREADY UPVOTED THE COMMENT
      comment.votes.upVotes.user.filter(user => {
        if (JSON.stringify(user) === JSON.stringify(userId)) {
          comment.votes.upVotes.user.remove(user)
        }
      })
      comment.votes.downVotes.user.unshift(userId)
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

  deleteComment: async (req, res, next) => {
    const { id, commentID } = req.params
    const userId = req.user.id.toString()
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No ticket exist' })
      }
      const comment = ticket.comments.id(commentID)
      if (userId !== comment.createdBy && !req.user.isAdmin && !req.user.isTicketsModerator) {
        // Only user who created the comment and admin can edit the comment
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Edit Forbidden by user' })
      }
      comment.remove()
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

  getModerators: async (req, res, next) => {
    try {
      const moderators = await UserModel.find({ isTicketsModerator: true })
      return res.status(HttpStatus.OK).json({ moderators: moderators })
    } catch (error) {
      console.log(error)
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },

  addModerator: async (req, res, next) => {
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
      return res.status(HttpStatus.OK).json({ success: 'Add moderator successful' })
    } catch (error) {
      console.log(error)
      HANDLER.handleError(res, {
        code: error.code || HttpStatus.BAD_REQUEST,
        ...error
      })
    }
  },

  removeModerator: async (req, res, next) => {
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
      return res.status(HttpStatus.OK).json({ success: 'Remove moderator successful' })
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
      if (userId !== ticket.createdBy && !req.user.isAdmin && !req.user.isTicketsModerator) {
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

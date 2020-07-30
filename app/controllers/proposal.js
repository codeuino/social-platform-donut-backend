const ProposalModel = require('../models/Proposal')
const UserModal = require('../models/User')
const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const AWS = require('aws-sdk')
const TAGS = require('../utils/notificationTags')
const proposalNotificationHelper = require('../utils/proposal-notif-helper')

module.exports = {
  // Creating a proposal
  createProposal: async (req, res, next) => {
    const proposal = new ProposalModel(req.body)
    const creator = req.body.creator

    try {
      await proposal.save()

      const user = await UserModal.findById(creator)
      const name = `${user.name.firstName} ${user.name.lastName}`

      req.io.emit('new proposal created', {
        heading: 'New Proposal Created',
        content: `New Proposal ${proposal.title} created by ${name}`,
        tag: TAGS.NEW
      })
      proposalNotificationHelper.addNotificationForAll(
        req,
        res,
        {
          heading: 'New Proposal Created',
          content: `New Proposal ${proposal.title} created by ${name}`,
          tag: TAGS.NEW
        },
        next
      )

      res.status(HttpStatus.CREATED).json({ proposal })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // Updates the content of the proposal
  saveProposal: async (req, res, next) => {
    const { proposalId } = req.params
    const { content, title, description } = req.body

    try {
      const proposal = await ProposalModel.findByIdAndUpdate(proposalId, {
        content: content,
        title: title,
        proposalDescription: description
      })
      if (!proposal) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'No proposal exists under the provided ID' })
      }
      res.status(HttpStatus.OK).json({ proposal: proposal })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // attaches a file to the given proposal
  attachFile: (req, res, next) => {
    const { proposalId } = req.params
    const file = req.file
    const s3FileURL = process.env.AWS_UPLOADED_FILE_URL_LINK

    const s3bucket = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    })

    var params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    }

    s3bucket.upload(params, function (err, data) {
      if (err) {
        res.status(500).json({ error: true, Message: err })
      } else {
        var newFileUploaded = {
          fileLink: s3FileURL + file.originalname,
          s3_key: params.Key
        }

        ProposalModel.findOneAndUpdate(
          { _id: proposalId },
          { $push: { attachments: newFileUploaded } },
          function (error, success) {
            if (error) {
              console.log(error)
            } else {
              console.log(success)
            }
          }
        )

        res.send({ data })
      }
    })
  },

  // Get proposals by userId
  getByUserId: async (req, res, next) => {
    const { userId } = req.params

    try {
      const proposals = await ProposalModel.find({ creator: userId })

      if (!proposals) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'No proposals found for the given user ID' })
      }
      return res.status(HttpStatus.OK).json({ proposal: proposals })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // Delete proposal by proposalId
  deleteById: async (req, res, next) => {
    try {
      const proposalId = req.body.proposalId

      const result = await ProposalModel.findByIdAndDelete(proposalId)
      const creator = result.creator

      const user = await UserModal.findById(creator)
      const name = `${user.name.firstName} ${user.name.lastName}`

      proposalNotificationHelper.addNotificationForAll(
        req,
        res,
        {
          heading: 'Proposal Deleted',
          content: `Proposal: "${result.title}" deleted by ${name}`,
          tag: TAGS.NEW
        },
        next
      )
      req.io.emit('proposal deleted', {
        heading: 'Proposal Deleted',
        content: `Proposal: "${result.title}" deleted by ${name}`,
        tag: TAGS.NEW
      })

      return res.status(HttpStatus.OK).json({ result: result })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // Changes the state of a given proposal
  changeState: async (req, res, next) => {
    const { proposalId } = req.params
    const proposalStatus = req.body.proposalStatus
    try {
      const proposal = await ProposalModel.findByIdAndUpdate(proposalId, {
        proposalStatus: proposalStatus
      })
      if (!proposal) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'No proposal exists under the provided ID' })
      }

      req.io.emit('proposal submitted', {
        heading: 'Proposal Submitted',
        content: `Proposal ${proposal.title} was submitted for review`,
        tag: TAGS.NEW
      })
      proposalNotificationHelper.addNotificationForAll(
        req,
        res,
        {
          heading: 'Proposal Submitted',
          content: `Proposal "${proposal.title}" was submitted for review`,
          tag: TAGS.NEW
        },
        next
      )
      res.status(HttpStatus.OK).json({ proposal: proposal })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // Obtains the proposal by given proposal ID
  getProposalById: async (req, res, next) => {
    const { proposalId } = req.params

    try {
      const proposal = await ProposalModel.findById(proposalId)

      if (!proposal) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ error: 'Proposal not found' })
      }
      return res.status(HttpStatus.OK).json({ proposal: proposal })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  getAllProposals: async (req, res, next) => {
    try {
      const proposals = await ProposalModel.find({})
      if (!proposals.length) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'No proposals found' })
      }
      return res.status(HttpStatus.OK).json({ proposals: proposals })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  commentOnProposal: async (req, res, next) => {
    const { proposalId, comment, userId, isAuthor, author } = req.body

    try {
      const user = await UserModal.findById(userId)
      if (!user) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'No user exists' })
      }
      const name = `${user.name.firstName} ${user.name.lastName}`

      const proposal = await ProposalModel.updateOne(
        { _id: proposalId },
        { $push: { comments: { userName: name, comment: comment } } }
      )

      const updatedProposal = await ProposalModel.findById(proposalId)

      if (!proposal) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Proposal could not be found!' })
      }
      if (!isAuthor) {
        proposalNotificationHelper.addToNotificationForUser(
          author,
          res,
          {
            heading: 'New comment',
            content: `New comments in your proposal "${updatedProposal.title}" by ${name}`,
            tag: TAGS.COMMENT
          },
          next
        )
      }

      return res.status(HttpStatus.OK).json({ proposal: proposal })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  getProposalNotificationsByUser: async (req, res, next) => {
    const userId = req.body.userId

    try {
      const user = await UserModal.findById(userId)
      if (!user) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'No user exists' })
      }

      return res
        .status(HttpStatus.OK)
        .json({ notifications: user.proposalNotifications })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

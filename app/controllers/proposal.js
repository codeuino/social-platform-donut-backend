const ProposalModel = require('../models/Proposal')
const UserModal = require('../models/User')
const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const AWS = require('aws-sdk')

module.exports = {
  // Creating a proposal
  createProposal: async (req, res, next) => {
    const proposal = new ProposalModel(req.body)

    try {
      await proposal.save()
      res.status(HttpStatus.CREATED).json({ proposal })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // Updates the content of the proposal
  saveProposal: async (req, res, next) => {
    const { proposalId } = req.params
    const content = req.body.content
    try {
      const proposal = await ProposalModel.findByIdAndUpdate(proposalId, {
        content: content
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
        res.send({ data })
        var newFileUploaded = {
          description: req.body.description,
          fileLink: s3FileURL + file.originalname,
          s3_key: params.Key
        }
        ProposalModel.updateOne(
          { _id: proposalId },
          { $push: { attachments: newFileUploaded } }
        ).then((proposal) => {
          console.log(proposal)
        })
      }
    })
  },

  // Get proposals by userId
  getByUserId: async (req, res, next) => {
    const userId = req.body.userId

    try {
      const proposals = await ProposalModel.find({ creator: userId })

      console.log(proposals)
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
      return res.status(HttpStatus.OK).json({ result: result })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // Changes the state of a given proposal
  changeState: async (req, res, next) => {
    const proposalId = req.body.proposalId
    const userId = req.body.userId
    const proposalStatus = req.body.proposalStatus
    try {
      const user = await UserModal.findById(userId)

      if (user.isAdmin === true) {
        const proposal = ProposalModel.findByIdAndUpdate(proposalId, {
          proposalStatus: proposalStatus
        })

        return res.status(HttpStatus.OK).json({ proposal: proposal })
      }
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ msg: "You don't have permission!" })
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
  }
}

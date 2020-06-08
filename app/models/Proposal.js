const mongoose = require('mongoose')
const Schema = mongoose.Schema
const validator = require('validator')

const proposalSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      validate (title) {
        if (validator.isEmpty(title)) {
          throw new Error('Proposal Title cannot be kept empty')
        }
      }
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization'
    },
    content: {
      type: String
    },
    proposalStatus: {
      type: String,
      required: true,
      default: 'draft'
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    attachments: [{ description: String, fileLink: String, s3_key: String }],

    createdAt: {
      type: Date,
      required: true,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now()
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Proposal', proposalSchema)

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const proposalSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    organization: {
      type: String
    },
    content: {
      type: String,
      required: true
    },
    proposalStatus: {
      type: String,
      default: 'draft'
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    proposalDescription: {
      type: String
    },
    attachments: [{ fileLink: String, s3_key: String }],

    createdAt: {
      type: Date,
      required: true,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now()
    },
    comments: [{ userName: String, comment: String }]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Proposal', proposalSchema)

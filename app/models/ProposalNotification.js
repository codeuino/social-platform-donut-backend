const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProposalNotification = new Schema({
  heading: {
    type: String
  },
  proposal: {
    type: String
  },
  content: {
    type: String
  },
  tag: {
    type: String
  },
  createdAt: {
    type: Date,
    default: new Date().toISOString().substring(0, 25)
  }
})
module.exports = mongoose.model('ProposalNotification', ProposalNotification)

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NotificationSchema = new Schema({
  heading: {
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
    default: Date.now()
  }
})
module.exports = mongoose.model('Notification', NotificationSchema)

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const activitySchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  activity: [{
    route: {
      type: String,
      required: true
    },
    method: {
      type: String,
      required: true
    },
    collectionType: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    timestamp: {
      type: String,
      required: true
    }
  }]
})

module.exports = mongoose.model('Activity', activitySchema)

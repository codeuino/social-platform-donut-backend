const mongoose = require('mongoose')

const urlShortnerSchema = new mongoose.Schema({
  longurl: {
    type: String,
    required: true
  },
  urlcode: {
    type: String
  },
  shorturl: {
    type: String
  }
})

const shortURL = mongoose.model('shortURL', urlShortnerSchema)
module.exports = shortURL

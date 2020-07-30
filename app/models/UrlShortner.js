const mongoose = require('mongoose')

const urlShortnerSchema = new mongoose.Schema({
  longUrl: {
    type: String,
    required: true
  },
  urlCode: {
    type: String
  },
  shortUrl: {
    type: String
  }
})

const shortURL = mongoose.model('shortURL', urlShortnerSchema)
module.exports = shortURL

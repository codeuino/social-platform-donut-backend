const mongoose = require('mongoose')
const Schema = mongoose.Schema

const googleUserSchema = new Schema({
  username: String,
  googleId: String,
  token: String,
  refreshToken: String
})

const GoogleUser = mongoose.model('googleuser', googleUserSchema)

module.exports = GoogleUser

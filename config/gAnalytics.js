const { google } = require('googleapis')
const clientEMail = process.env.CLIENT_EMAIL
const privateKey = process.env.PRIVATE_KEY
const scopes = ['https://www.googleapis.com/auth/analytics.readonly']

module.exports = new google.auth.JWT({
  email: clientEMail,
  key: privateKey,
  scopes
})

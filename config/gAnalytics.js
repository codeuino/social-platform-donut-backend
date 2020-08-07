const { google } = require('googleapis')
const clientEMail = process.env.CLIENT_EMAIL
const privateKey = process.env.PRIVATE_KEY
const scope = process.env.SCOPE

module.exports = new google.auth.JWT({
  email: clientEMail,
  key: privateKey,
  scopes: [scope]
})

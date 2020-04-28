const emailTemplate = require('../../views/emailTemplate')
const sendgridMail = require('@sendgrid/mail')
const HttpStatus = require('http-status-codes')

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY)

const email = (req, res, next) => {
  const message = {
    to: req.body.email,
    from: 'services@codeuino.com',
    subject: `Welcome to Donut ${req.body.name.firstName}`,
    html: emailTemplate
  }
  sendgridMail.send(message).then(
    () => {
      next()
    },
    (error) => {
      res.status(HttpStatus.BAD_REQUEST).send({
        error: process.env.SENDGRID_API_KEY
          ? error.response.body
          : 'Setup SENDGRID_API_KEY environment variable'
      })
    }
  )
}

module.exports = email

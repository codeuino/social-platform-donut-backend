const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const emailTemplate = require('../../views/emailTemplate')

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  })
)

let emailServices = {
  sendSuccessfulSignupEmail: (email, name) => {
    transporter.sendMail({
      to: email,
      from: 'services@codeuino.com',
      subject: `Welcome to Donut ${name}`,
      html: emailTemplate
    })
  }
}

module.exports = emailServices

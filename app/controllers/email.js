const sendgridMail = require('@sendgrid/mail')
const ejs = require('ejs')
const path = require('path')
const sendGridApi = process.env.SENDGRID_API_KEY || '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'

sendgridMail.setApiKey(sendGridApi)

module.exports = {
  sendEmail: async (req, res, next, token) => {
    const filePath = path.join(__dirname, '/../../views/emailTemplate.ejs')
    ejs.renderFile(filePath, { token: token }, (err, data) => {
      if (err) {
        console.log('Error in renderFile ', err)
      } else {
        const message = {
          to: req.body.email,
          from: 'services@codeuino.com',
          subject: `Welcome to Donut ${req.body.name.firstName}`,
          html: data
        }
        sendgridMail.send(message).then(
          () => {
            console.log('sending email')
          },
          (error) => {
            console.log('error in sending email ', error)
            if (error.response) {
              console.error(error.response.body)
            }
          }
        )
      }
    })
  }
}

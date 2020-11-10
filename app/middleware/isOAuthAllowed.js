const Organisation = require('../models/Organisation')
const HttpStatus = require('http-status-codes')
const afterAuthRedirect = (process.env.clientbaseurl + '/login') ||  'http://localhost:3000/login'

const isOAuthAllowed = async (req, res, next) => {
  try {
    const org = await Organisation.find({});
    if (org.length === 0) {
      return res.status(HttpStatus.NOT_FOUND).json({
        error: 'Organization does not exist!'
      })
    }
    switch (req._parsedUrl.path.slice(6, 12)) {
      case 'google': {
        if(org[0].options.authentication.google) {
          next()
        }else {
          throw new Error('Google OAuth Not Allowed')
        }
        break;
      }
      case 'github': {
        if(org[0].options.authentication.github) {
          next()
        }else {
          throw new Error('GitHub OAuth Not Allowed')
        }
        break;
      }
      default: {
        if(org[0].options.authentication.email) {
          next()
        }else {
          throw new Error('Email Auth has beed turned off!')
        }
        break;
      }
    }
  } catch (Error) {
      res.redirect(afterAuthRedirect)
  }
}

module.exports = isOAuthAllowed

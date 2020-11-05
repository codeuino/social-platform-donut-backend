const passport = require('passport')
const HttpStatus = require('http-status-codes')
const afterAuthRedirect = (process.env.clientbaseurl + '/login') ||  'http://localhost:3000/login'

const passportGoogleAuthenticate = async (req, res, next) => {
  passport.authenticate('google', { scope: ['profile','email'], session: false })(req, res, next)
}
const passportGoogleAuthenticateCallback = async (req, res, next) => {
  passport.authenticate('google', (err, details) => {
    if(err) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        msg: 'Something went wrong while authenticating!'
      })
    }
    if(details.token===undefined || !details.token) {
      res.redirect(afterAuthRedirect)
    }else {
      res.cookie("token", details.token, { httpOnly: true }).redirect(afterAuthRedirect);
    }
  })(req, res, next)
}
module.exports = {passportGoogleAuthenticate, passportGoogleAuthenticateCallback}

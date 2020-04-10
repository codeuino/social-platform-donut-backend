const GoogleStrategy = require('passport-google-oauth20').Strategy
const GoogleUser = require('../app/models/GoogleUser')
const passport = require('passport')
const refresh = require('passport-oauth2-refresh')

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  GoogleUser.findById(id).then((user) => {
    done(null, user)
  })
})

const strategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CLIENT_CALLBACKURL
  },
  (accessToken, refreshToken, profile, done) => {
    GoogleUser.findOneAndUpdate(
      { googleId: profile.id },
      { token: accessToken, refreshToken: refreshToken },
      { new: true, upsert: true },
      (err, currentUser) => {
        if (err) {
          done(null, false, { message: 'Error in findOneAndUpdate method' })
        }
        if (currentUser) {
          done(null, currentUser)
        } else {
          new GoogleUser({
            username: profile.displayName,
            googleId: profile.id,
            token: accessToken,
            refreshToken: refreshToken
          }).save((err, newUser) => {
            if (err) {
              done(null, false, { message: 'Error saving new user' })
            } else {
              done(null, newUser)
            }
          })
        }
      }
    )
  }
)

passport.use(strategy)
refresh.use(strategy)

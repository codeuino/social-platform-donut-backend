const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const user = require('../controllers/user');
const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || '';
const GOOGLE_OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
const GOOGLE_OAUTH_CALLBACK = process.env.GOOGLE_OAUTH_CALLBACK || '';

passport.use(new GoogleStrategy({
  clientID: GOOGLE_OAUTH_CLIENT_ID,
  clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
  callbackURL: GOOGLE_OAUTH_CALLBACK,
  proxy: true
}, (accessToken, refreshToken, profile, next) => {

  const provider="google";
  user.findOrCreateForOAuth(profile, provider)
    .then(details => {
      if (details) {
        next(null, details);
      } else {
        next(null, false);
      }
    }).catch(err=>console.log(err))
}));

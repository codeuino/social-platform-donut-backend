const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const user = require('../controllers/user');
const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || '';
const GOOGLE_OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
const GOOGLE_OAUTH_CALLBACK = process.env.GOOGLE_OAUTH_CALLBACK || '';
const GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID || '';
const GITHUB_OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET || '';
const GITHUB_OAUTH_CALLBACK = process.env.GITHUB_OAUTH_CALLBACK || '';

module.exports = {
  initGoogleAuth: () => {
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
        }).catch(err=>next(err))
    }));
  },
  initGitHubAuth: () => {
    passport.use(new GitHubStrategy({
      clientID: GITHUB_OAUTH_CLIENT_ID,
      clientSecret: GITHUB_OAUTH_CLIENT_SECRET,
      callbackURL: GITHUB_OAUTH_CALLBACK,
      proxy: true,
      scope: ['user:email']
    }, (accessToken, refreshToken, profile, next) => {
      const provider="github";
      user.findOrCreateForOAuth(profile, provider)
        .then(details => {
          if (details) {
            next(null, details);
          } else {
            next(null, false);
          }
        }).catch(err=>next(err))
    }));
  }
}

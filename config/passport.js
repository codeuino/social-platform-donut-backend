const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GoogleUser = require("../app/models/GoogleUser");
const passport = require("passport");
const refresh = require("passport-oauth2-refresh");

// Google
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  GoogleUser.findById(id).then(user => {
    done(null, user);
  });
});

let strategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/oauth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    GoogleUser.findOneAndUpdate(
      { googleId: profile.id },
      { token: accessToken, refreshToken: refreshToken },
      { new: true, upsert: true }
    ).then(currentUser => {
      if (currentUser) {
        done(null, currentUser);
      } else {
        new GoogleUser({
          username: profile.displayName,
          googleId: profile.id,
          token: accessToken,
          refreshToken: refreshToken
        })
          .save()
          .then(newUser => {
            done(null, newUser);
          });
      }
    });
  }
);

passport.use(strategy);
refresh.use(strategy);

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const configAuth = require('./authTokens');
const User = require('../app/models/User')


module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new GoogleStrategy({
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({email: profile.emails[0].value}, async function(err,user){
            if(!user){
                const user = new User();
                user.name = profile.displayName;
                user.provider = profile.provider;
                user.providerID = profile.id;
                user.email = profile.emails[0].value;
                user.save()
            }
            return done(err, user);
        })
    }
    ));
    passport.use(new GitHubStrategy({
        clientID        : configAuth.githubAuth.clientID,
        clientSecret    : configAuth.githubAuth.clientSecret,
        callbackURL     : configAuth.githubAuth.callbackURL,
    },
    async function(accessToken, refreshToken, profile, done) {
        User.findOne({email: profile.emails[0].value}, async function(err,user){
            if(!user){
                const user = new User();
                user.name = profile.displayName;
                user.provider = profile.provider;
                user.providerID = profile.id;
                user.email = profile.emails[0].value;
                user.save()
            }
            return done(err, user);
        })
    }
    ));

};

module.exports = {
    'githubAuth' : {
        'clientID'      : process.env.GITHUBCLIENTID,
        'clientSecret'  : process.env.GITHUBSECRET,
        'callbackURL'   : 'http://localhost:4000/auth/github/callback'
    },
    'googleAuth' : {
        'clientID'      : process.env.GOOGLECLIENTID,
        'clientSecret'  : process.env.GOOGLECLIENTSECRET,
        'callbackURL'   : 'http://localhost:4000/auth/google/callback'
    }
};
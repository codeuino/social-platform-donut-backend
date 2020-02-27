var express = require('express')
var router = express.Router()
const passport = require('passport')
const authPassport = require('../../config/authPassport');
const documentationUrl = 'https://documenter.getpostman.com/view/1159934/SWDze1Rp'

authPassport(passport);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect(documentationUrl)
})

router.get('/auth/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
}));

router.get('/auth/google/callback',
  passport.authenticate('google', {
      failureRedirect: 'http://localhost:3000'
  }),
  (req, res) => {
      res.redirect('http://localhost:3000/dashboard');
  }
);

router.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

router.get('/auth/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: 'http://localhost:3000'
   }),
  (req, res) => {
    res.redirect('http://localhost:3000/dashboard');
  });

module.exports = router

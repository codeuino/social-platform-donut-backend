var express = require('express')
var router = express.Router()
const documentation_url = "https://documenter.getpostman.com/view/1159934/SWDze1Rp"
/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect(documentation_url);
})

module.exports = router

var express = require('express')
var router = express.Router()
const documentationUrl = 'https://documenter.getpostman.com/view/1159934/SWDze1Rp'
/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect(documentationUrl)
})

module.exports = router

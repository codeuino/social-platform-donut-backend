var express = require('express')
var router = express.Router()
const documentationUrl = 'https://documenter.getpostman.com/view/1159934/SWDze1Rp'

/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect(documentationUrl)
})

// router.get('/:shorturl', (req, res, next) => {
//   res.redirect('/shortUrl/' + req.params.shorturl)
// })

module.exports = router

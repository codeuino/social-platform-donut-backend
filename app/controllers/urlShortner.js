const UrlModel = require('../models/UrlShortner')
const HttpStatus = require('http-status-codes')

const regex = '^(https?:\\/\\/)?' +
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' +
  '((\\d{1,3}\\.){3}\\d{1,3}))' +
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
  '(\\?[;&amp;a-z\\d%_.~+=-]*)?' +
  '(\\#[-a-z\\d_]*)?$'

function validURL (myURL) {
  var pattern = new RegExp(regex, 'i')
  return pattern.test(myURL)
}

module.exports = {
  redirect: async function (req, res) {
    try {
      const url = await UrlModel.findOne({ urlcode: req.params.shorturl })

      if (url) {
        return res.status(HttpStatus.OK).redirect(url.longurl)
      } else {
        return res.status(HttpStatus.NOT_FOUND).json('No url found!')
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json('Server error!')
    }
  },

  shorten: async function (req, res) {
    var longurl = req.body
    var baseurl = req.get('host')
    var urlcode = Date.now()
    if (validURL(longurl.longurl)) {
      try {
        var url = await UrlModel.findOne(longurl)
        if (url) {
          res.status(HttpStatus.OK).json(url)
        } else {
          var shorturl = baseurl + '/' + urlcode
          url = new UrlModel({
            longurl: longurl.longurl,
            shorturl,
            urlcode
          })
          await url.save()
          res.status(HttpStatus.CREATED).json(url)
        }
      } catch (error) {
        console.log(error)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json('Server error')
      }
    } else {
      res.status(HttpStatus.NOT_FOUND).json('invalid long url')
    }
  }
}

const UrlModel = require('../models/UrlShortner')

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
        return res.redirect(url.longurl)
      } else {
        return res.json('No url found!')
      }
    } catch (error) {
      res.json('Server error!')
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
          res.json(url)
        } else {
          var shorturl = baseurl + '/' + urlcode
          url = new UrlModel({
            longurl: longurl.longurl,
            shorturl,
            urlcode
          })
          await url.save()
          res.json(url)
        }
      } catch (error) {
        console.log(error)
        res.json('Server error')
      }
    } else {
      res.json('invalid long url')
    }
  }
}

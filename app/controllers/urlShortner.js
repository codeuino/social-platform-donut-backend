const UrlModel = require('../models/UrlShortner')
const HttpStatus = require('http-status-codes')
const validator = require('validator')

module.exports = {
  redirect: async (req, res) => {
    try {
      const { urlcode } = req.params
      const url = await UrlModel.findOne({ urlCode: urlcode })
      if (url) {
        return res.status(HttpStatus.OK).redirect(url.longUrl)
      } else {
        return res.status(HttpStatus.NOT_FOUND).json('No url found!')
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json('Server error!')
    }
  },

  shorten: async (req, res) => {
    var { longUrl } = req.body
    var baseurl = req.get('host')
    var urlCode = Date.now()
    if (validator.isURL(longUrl)) {
      try {
        var url = await UrlModel.findOne({ longUrl })
        if (url) {
          return res.status(HttpStatus.OK).json(url)
        }
        var shortUrl = baseurl + '/' + urlCode
        url = new UrlModel({
          longUrl: longUrl,
          shortUrl: shortUrl,
          urlCode: urlCode
        })
        await url.save()
        res.status(HttpStatus.CREATED).json(url)
      } catch (error) {
        console.log(error)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json('Server error')
      }
    } else {
      res.status(HttpStatus.NOT_FOUND).json('invalid long url')
    }
  }
}

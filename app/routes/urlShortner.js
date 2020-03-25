const express = require('express')
const router = express.Router()
const shortnerController = require('../controllers/UrlShortner')

// Redirects the ShortURL back to LongURL
router.get(
  '/:shorturl',
  shortnerController.redirect
)

// Shorten the LongURL and saves in DB
router.post(
  '/shorten',
  shortnerController.shorten
)

module.exports = router

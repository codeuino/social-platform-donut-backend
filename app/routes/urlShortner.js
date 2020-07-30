const express = require('express')
const router = express.Router()
const shortnerController = require('../controllers/urlShortner')

// Redirects the ShortURL back to LongURL
router.get(
  '/:urlcode',
  shortnerController.redirect
)

// Shorten the LongURL and saves in DB
router.post(
  '/shorten',
  shortnerController.shorten
)

module.exports = router

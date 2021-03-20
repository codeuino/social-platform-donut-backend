const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const wikisController = require('../controllers/wikis')
const isUnderMaintenance = require('../middleware/maintenance')

router.get(
  '/',
  auth,
  wikisController.getWikis
)

router.get(
  '/oauth-callback',
  wikisController.oauthCallback
)

router.get(
  '/oauth-check',
  auth,
  wikisController.oauthCheck
)

router.get(
  '/pages',
  auth, wikisController.getPage
)

router.post(
  '/pages',
  isUnderMaintenance,
  auth,
  wikisController.newPage
)

router.patch(
  '/pages',
  isUnderMaintenance,
  auth,
  wikisController.editPage
)

router.delete(
  '/pages',
  isUnderMaintenance,
  auth,
  wikisController.deletePage
)

module.exports = router

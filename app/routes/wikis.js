const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const wikisController = require('../controllers/wikis')
const isUnderMaintenance = require('../middleware/maintenance')

router.get(
  '/',
  isUnderMaintenance,
  auth,
  wikisController.getWikis
)

router.get(
  '/oauth-callback',
  isUnderMaintenance,
  wikisController.oauthCallback
)

router.get(
  '/oauth-check',
  isUnderMaintenance,
  auth,
  wikisController.oauthCheck
)

router.get(
  '/pages',
  isUnderMaintenance,
  auth, wikisController.getPage
)

router.post(
  '/pages',
  isUnderMaintenance,
  auth,
  wikisController.newPage
)

router.put(
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

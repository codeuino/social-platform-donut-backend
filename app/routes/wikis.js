const express = require('express')
const router = express.Router()
const wikisController = require('../controllers/wikis')

router.get('/', wikisController.getWikis)
// router.put('/', wikisController.editWikis)
router.get('/oauth-callback', wikisController.oauthCallback)
router.get('/oauth-check', wikisController.oauthCheck)
router.get('/pages', wikisController.getPage)
router.post('/pages', wikisController.newPage)
router.put('/pages', wikisController.editPage)
router.delete('/pages', wikisController.deletePage)
module.exports = router

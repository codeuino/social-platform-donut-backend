const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const OrgController = require('../controllers/organization')
const uploader = require('../utils/uploader')

// CREATE ORG
router.post(
  '/',
  uploader.upload.single('image'),
  auth,
  OrgController.createOrganization
)

// GET ORG DETAILS BY ID
router.get(
  '/:id',
  auth,
  OrgController.getOrgDetailsById
)

// GET ARCHIVED ALL ORG
router.get(
  '/archive/all',
  auth,
  OrgController.getAllArchived
)

// UPDATE ORG DETAILS
router.patch(
  '/:id',
  uploader.upload.single('image'),
  auth,
  OrgController.updateOrgDetails
)

// DELETE ORG
router.delete(
  '/:id',
  auth,
  OrgController.deleteOrg
)

// ARCHIVE ORG
router.patch(
  '/archive/:id',
  auth,
  OrgController.archiveOrg
)

module.exports = router

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

// TRIGGER MAINTENANCE MODE
router.patch(
  '/maintenance',
  auth,
  OrgController.triggerMaintenance
)

// GET ORG OVERVIEW FOR INSIGHT PAGE
router.get(
  '/overview/all',
  auth,
  OrgController.getOrgOverView
)

// GET MEMBERS FOR INSIGHT PAGE
router.get(
  '/members/all',
  auth,
  OrgController.getMembers
)

module.exports = router

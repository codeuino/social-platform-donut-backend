const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const OrgController = require('../controllers/organization')
const fileToBuffer = require('../utils/fileToBuffer')
const isUnderMaintenance = require('../middleware/maintenance')
const compressAndUpload = require('../utils/compressAndUpload')

// CREATE ORG
router.post(
  '/',
  isUnderMaintenance,
  fileToBuffer.processFile.single('image'),
  compressAndUpload.imageCompressor,
  OrgController.createOrganization
)

// GET ORG DETAILS BY ID
router.get(
  '/:id',
  isUnderMaintenance,
  auth,
  OrgController.getOrgDetailsById
)

// UPDATE ORG DETAILS
router.patch(
  '/:id',
  isUnderMaintenance,
  fileToBuffer.processFile.single('image'),
  compressAndUpload.imageCompressor,
  auth,
  OrgController.updateOrgDetails
)

// DELETE ORG
router.delete(
  '/:id',
  isUnderMaintenance,
  auth,
  OrgController.deleteOrg
)

// ARCHIVE ORG
router.patch(
  '/archive/:id',
  isUnderMaintenance,
  auth,
  OrgController.archiveOrg
)

// TRIGGER MAINTENANCE MODE
router.patch(
  '/:id/maintenance',
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

// UPDATE THE ORG SETTINGS
router.patch(
  '/:id/settings/update',
  isUnderMaintenance,
  auth,
  OrgController.updateSettings
)

// REMOVE ADMIN
router.patch(
  '/remove/:orgId/:userId',
  isUnderMaintenance,
  auth,
  OrgController.removeAdmin
)

// GET ORG LOGIN OPTIONS (CALLED JUST BEFORE LOGIN)
router.get(
  '/login/options',
  isUnderMaintenance,
  OrgController.getOrgLoginOptions
)

module.exports = router

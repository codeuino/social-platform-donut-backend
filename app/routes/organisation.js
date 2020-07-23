const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const OrgController = require('../controllers/organization')
const uploader = require('../utils/uploader')
const isUnderMaintenance = require('../middleware/maintenance')
const activity = require('../middleware/activity')

// CREATE ORG
router.post(
  '/',
  isUnderMaintenance,
  uploader.upload.single('image'),
  auth,
  OrgController.createOrganization,
  activity
)

// GET ORG DETAILS BY ID
router.get(
  '/:id',
  isUnderMaintenance,
  auth,
  OrgController.getOrgDetailsById,
  activity
)

// UPDATE ORG DETAILS
router.patch(
  '/:id',
  isUnderMaintenance,
  uploader.upload.single('image'),
  auth,
  OrgController.updateOrgDetails,
  activity
)

// DELETE ORG
router.delete(
  '/:id',
  isUnderMaintenance,
  auth,
  OrgController.deleteOrg,
  activity
)

// ARCHIVE ORG
router.patch(
  '/archive/:id',
  isUnderMaintenance,
  auth,
  OrgController.archiveOrg,
  activity
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
  OrgController.updateSettings,
  activity
)

// REMOVE ADMIN
router.patch(
  '/remove/:orgId/:userId',
  isUnderMaintenance,
  auth,
  OrgController.removeAdmin,
  activity
)

module.exports = router

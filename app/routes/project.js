const express = require('express')
const projectController = require('../controllers/project')
const router = express.Router()
const auth = require('../middleware/auth')
const isUnderMaintenance = require('../middleware/maintenance')

// ADD PROJECT
router.post(
  '/',
  isUnderMaintenance,
  auth,
  projectController.createProject
)

// GET ALL PROJECTS
router.get(
  '/',
  isUnderMaintenance,
  auth,
  projectController.getAllProjects
)

// GET PROJECT BY ID
router.get(
  '/:id',
  isUnderMaintenance,
  auth,
  projectController.getProjectById
)

// UPDATE PROJECT INFO
router.patch(
  '/:id',
  isUnderMaintenance,
  auth,
  projectController.updateProject
)

// DELETE PROJECT
router.delete(
  '/:id',
  isUnderMaintenance,
  auth,
  projectController.deleteProject
)

// GET PROJECTS CREATED BY A USER
router.get(
  '/:id/all',
  isUnderMaintenance,
  auth,
  projectController.projectCreatedByUser
)

module.exports = router

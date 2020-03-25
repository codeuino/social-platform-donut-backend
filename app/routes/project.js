const express = require('express')
const router = express.Router()
const projectController = require('../controllers/project')

// create a project
router.post(
  '/',
  projectController.createProject
)

// get the details of all the projects
router.get(
  '/',
  projectController.projectInfo
)

// update a particular project info
router.patch(
  '/:id',
  projectController.projectInfoUpdate
)

// delete a particular project
router.delete(
  '/:id',
  projectController.projectDelete
)

module.exports = router

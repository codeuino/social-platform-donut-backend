const express = require('express')
const router = express.Router()
const projectController = require('../controllers/project')

router.post(
  '/',
  projectController.createProject
)

router.get(
  '/',
  projectController.projectInfo
)

router.patch(
  '/update/:id',
  projectController.projectInfoUpdate
)

router.delete(
  '/delete/:id',
  projectController.projectDelete
)

module.exports = router

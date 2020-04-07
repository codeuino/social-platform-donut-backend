const express = require('express')
const router = express.Router()
const projectController = require('../controllers/project')
const auth = require('../middleware/auth')

router.post(
  '/',
  auth,
  projectController.createProject
)

router.get(
  '/',
  auth,
  projectController.projectInfo
)

router.patch(
  '/update/:id',
  auth,
  projectController.projectInfoUpdate
)

router.delete(
  '/delete/:id',
  auth,
  projectController.projectDelete
)

module.exports = router

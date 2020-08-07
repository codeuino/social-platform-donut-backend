const Project = require('../models/Project')
const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const helper = require('../utils/paginate')
const permission = require('../utils/permission')
const settingsHelper = require('../utils/settingHelpers')

module.exports = {
  createProject: async (req, res, next) => {
    try {
      const project = await new Project(req.body)
      project.createdBy = req.user._id
      await project.save()
      return res.status(HttpStatus.CREATED).json({ project })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  getAllProjects: async (req, res, next) => {
    try {
      const projects = await Project.find({}, {}, helper.paginate(req))
        .populate('createdBy', '_id name.firstName name.lastName email')
        .sort({ updatedAt: -1 })
        .exec()
      return res.status(HttpStatus.OK).json({ projects })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  getProjectById: async (req, res, next) => {
    const { id } = req.params
    try {
      const project = await Project.findById(id)
        .populate('createdBy', '_id name.firstName name.lastName email')
        .lean()
        .exec()
      if (!project) {
        return res.status(HttpStatus.OK).json({ msg: 'Post doesn\'t exists!' })
      }
      return res.status(HttpStatus.OK).json({ project })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  updateProject: async (req, res, next) => {
    const { id } = req.params
    const updates = Object.keys(req.body)
    const allowedUpdates = [
      'projectName',
      'description',
      'imgUrl',
      'img',
      'version',
      'links',
      'contributors',
      'maintainers'
    ]
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
    })
    try {
      const project = await Project.findById(id)
        .populate('createdBy', '_id name.firstName name.lastName email')
        .exec()
      if (!project) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No such project exits!' })
      }
      // permission check for admin and creator || is edit allowed
      if (!permission.check(req, res, project.createdBy) || (!settingsHelper.canEdit())) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'Bad Update Request!' })
      }
      // if allowed check edit limit
      if (!settingsHelper.isEditAllowedNow(project.createdAt)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'Edit limit expired!' })
      }
      // check if valid edit
      if (!isValidOperation) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'Invalid update!' })
      }
      updates.forEach((update) => {
        project[update] = req.body[update]
      })
      await project.save()
      return res.status(HttpStatus.OK).json({ project })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  deleteProject: async (req, res, next) => {
    const { id } = req.params
    try {
      const project = await Project.findById(id)
      if (!project) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No such project exits!' })
      }
      // check if admin or user who created this project
      if (permission.check(req, res, project.createdBy)) {
        await Project.findByIdAndRemove(id)
        return res.status(HttpStatus.OK).json({ msg: 'Project deleted!' })
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'Not permitted!' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  projectCreatedByUser: async (req, res, next) => {
    try {
      const { id } = req.params
      const projects = await Project.find({ createdBy: id }, {}, helper.paginate(req))
        .populate('createdBy', '_id name.firstName name.lastName email')
        .sort({ updatedAt: -1 })
        .exec()
      return res.status(HttpStatus.OK).json({ projects })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

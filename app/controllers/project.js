const Project = require('../models/Project')
const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')

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
    const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10
    const page = req.query.page ? parseInt(req.query.page) : 1
    try {
      const projects = await Project.find({})
        .skip((page - 1) * pagination)
        .limit(pagination)
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
      if (project.createdBy === req.user._id.toString() || req.user.isAdmin === true) {
        await Project.findByIdAndRemove(id)
        return res.status(HttpStatus.OK).json({ msg: 'Project deleted!' })
      }
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  projectCreatedByUser: async (req, res, next) => {
    const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10
    const currentPage = req.query.page ? parseInt(req.query.page) : 1
    try {
      const { id } = req.user
      const projects = await Project.find({ createdBy: id })
        .skip((currentPage - 1) * pagination)
        .limit(pagination)
        .populate('createdBy', '_id name.firstName name.lastName email')
        .sort({ updatedAt: -1 })
        .exec()
      if (projects.length === 0) {
        return res.status(HttpStatus.OK).json({ msg: 'No projects created by user yet!' })
      }
      return res.status(HttpStatus.OK).json({ projects })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

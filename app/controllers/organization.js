const Organization = require('../models/Organisation')
const HANDLER = require('../utils/response-helper')
const STATUS = require('../utils/status-codes')
const helper = require('../utils/uploader')

module.exports = {
  createOrganization: async (req, res, next) => {
    const org = new Organization(req.body)
    if (req.file) {
      helper.mapToDb(req, org)
    }
    try {
      await org.save()
      res.status(STATUS.CREATED).json({ org })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  updateOrgDetails: async (req, res, next) => {
    const { id } = req.params
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'description', 'contactInfo', 'image', 'adminInfo', 'moderatorInfo']
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
      return res.status(STATUS.BAD_REQUEST).json({ error: 'invalid update' })
    }
    try {
      const org = await Organization.findById(id)
      updates.forEach(update => {
        org[update] = req.body[update]
      })
      if (req.file) {
        helper.mapToDb(req, org)
      }
      await org.save()
      res.status(STATUS.UPDATED).json({ organization: org })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  getOrgDetailsById: async (req, res, next) => {
    const { id } = req.params
    try {
      const orgData = await Organization
        .findById(id)
        .populate('adminInfo', ['name.firstName', 'name.lastName', 'email', 'isAdmin'])
        .populate('moderatorInfo', ['name.firstName', 'name.lastName', 'email', 'isAdmin'])
        .sort({ createdAt: -1 })
        .exec()
      if (!orgData) {
        return res.status(STATUS.NOT_FOUND).json({ error: 'No such organization exists!' })
      }
      res.status(STATUS.OK).json({ organization: orgData })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  deleteOrg: async (req, res, next) => {
    const { id } = req.params
    try {
      const org = await Organization.findByIdAndRemove(id)
      if (!org) {
        return res.status(STATUS.NOT_FOUND).json({ error: 'No such organization exists!' })
      }
      res.status(STATUS.OK).json({ organization: org })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  archiveOrg: async (req, res, next) => {
    const { id } = req.params
    try {
      const org = await Organization.findById(id)
      if (!org) {
        return res.status(STATUS.NOT_FOUND).json({ error: 'No such organization exists!' })
      }
      org.isArchived = true
      await org.save()
      res.status(STATUS.OK).json({ organization: org })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  getAllArchived: async (req, res, next) => {
    try {
      const orgs = await Organization.find({ isArchived: true })
        .populate('adminInfo', ['name.firstName', 'name.lastName', 'email', 'isAdmin'])
        .populate('moderatorInfo', ['name.firstName', 'name.lastName', 'email', 'isAdmin'])
        .sort({ createdAt: -1 })
        .exec()
      if (orgs.length === 0) {
        return res.status(STATUS.OK).json({ msg: 'No archived post exists!' })
      }
      res.status(STATUS.OK).json({ organization: orgs })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

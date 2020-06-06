const Organization = require('../models/Organisation')
const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const helper = require('../utils/uploader')

module.exports = {
  createOrganization: async (req, res, next) => {
    const org = new Organization(req.body)
    if (req.file) {
      helper.mapToDb(req, org)
    }
    try {
      await org.save()
      res.status(HttpStatus.CREATED).json({ org })
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
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'invalid update' })
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
      res.status(HttpStatus.OK).json({ organization: org })
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
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No such organization exists!' })
      }
      res.status(HttpStatus.OK).json({ organization: orgData })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  deleteOrg: async (req, res, next) => {
    const { id } = req.params
    try {
      const org = await Organization.findByIdAndRemove(id)
      if (!org) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No such organization exists!' })
      }
      res.status(HttpStatus.OK).json({ organization: org })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  archiveOrg: async (req, res, next) => {
    const { id } = req.params
    try {
      const org = await Organization.findById(id)
      if (!org) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No such organization exists!' })
      }
      org.isArchived = true
      await org.save()
      res.status(HttpStatus.OK).json({ organization: org })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  triggerMaintenance: async (req, res, next) => {
    const { id } = req.params
    try {
      const organization = await Organization.findById(id)
      // if org exists or not
      if (!organization) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No such organization exists!' })
      }
      // if user is admin or not
      const adminIds = organization.adminInfo.adminId
      const isAdmin = adminIds.indexOf(req.user.id)
      // user is admin then perform operation
      if (isAdmin !== -1) {
        // toggle maintenance mode
        organization.isMaintenance = !organization.isMaintenance
        await organization.save()
        if (organization.isMaintenance) {
          return res.status(HttpStatus.OK).json({ msg: 'Organization is kept under the maintenance!!' })
        }
        return res.status(HttpStatus.OK).json({ msg: 'Organization is recovered from maintenance!!' })
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'You don\'t have access to triggerMaintenance!' })
      }
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  updateSettings: async (req, res, next) => {
    const { id } = req.params
    try {
      // check if org exists
      const organization = await Organization.findById(id)
      if (!organization) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No Organization found!' })
      }
      // check if user is admin or not
      const adminIds = organization.adminInfo.adminId
      const isAdmin = adminIds.indexOf(req.user.id)
      const updates = Object.keys(req.body)
      console.log('req.body ', req.body)
      console.log('isAdmin ', isAdmin)
      const allowedUpdates = [
        'settings',
        'permissions',
        'authentication'
      ]
      // if admin then check if valid update
      if (isAdmin !== -1) {
        const isValidOperation = updates.every((update) => {
          return allowedUpdates.includes(update)
        })
        // if valid update
        if (isValidOperation) {
          updates.forEach(update => {
            organization.options[update] = req.body[update]
          })
          await organization.save()
          return res.status(HttpStatus.OK).json({ msg: 'Successfully updated!' })
        }
        // invalid update
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'Invalid update' })
      }
      // else not admin
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'You don\'t have access to perform this operation!' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

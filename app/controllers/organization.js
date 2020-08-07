const Organization = require('../models/Organisation')
const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')
const helper = require('../utils/uploader')
const paginater = require('../utils/paginate')
const notificationHelper = require('../utils/notif-helper')
const User = require('../models/User')
const Project = require('../models/Project')
const Event = require('../models/Event')
const permission = require('../utils/permission')
const TAGS = require('../utils/notificationTags')
const Organisation = require('../models/Organisation')
const notification = {
  heading: '',
  content: '',
  tag: ''
}

module.exports = {
  createOrganization: async (req, res, next) => {
    const org = new Organization(req.body)
    if (req.file) {
      helper.mapToDb(req, org)
    }
    try {
      const orgData = await org.save()
      req.io.emit('new org created', { data: orgData.name })
      notification.heading = 'New org!'
      notification.content = `${orgData.name} is created!`
      notification.tag = TAGS.NEW
      notificationHelper.addToNotificationForAll(req, res, notification, next)
      return res.status(HttpStatus.CREATED).json({ orgData })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  updateOrgDetails: async (req, res, next) => {
    const { id } = req.params
    const updates = Object.keys(req.body)
    const allowedUpdates = [
      'name',
      'description',
      'contactInfo',
      'image',
      'imgUrl',
      'adminInfo',
      'moderatorInfo'
    ]
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'invalid update' })
    }
    try {
      const org = await Organization.findById(id)
      // check for permission (ONLY ADMINS CAN UPDATE)
      if (!permission.check(req, res)) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ msg: "You don't have the permission" })
      }
      updates.forEach((update) => {
        org[update] = req.body[update]
      })
      if (req.file) {
        helper.mapToDb(req, org)
      }
      await org.save()
      return res.status(HttpStatus.OK).json({ organization: org })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  getOrgDetailsById: async (req, res, next) => {
    const { id } = req.params
    try {
      const orgData = await Organization.findById(id)
        .populate('adminInfo', [
          'name.firstName',
          'name.lastName',
          'email',
          'isAdmin'
        ])
        .populate('moderatorInfo', [
          'name.firstName',
          'name.lastName',
          'email',
          'isAdmin'
        ])
        .sort({ createdAt: -1 })
        .lean()
        .exec()
      if (!orgData) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ error: 'No such organization exists!' })
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
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ error: 'No such organization exists!' })
      }
      // check for permission
      if (!permission.check(req, res)) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ msg: "You don't have the permission!" })
      }
      req.io.emit('org deleted', { data: org.name })
      notification.heading = 'Org deleted!'
      notification.content = `${org.name} is deleted!`
      notification.tag = TAGS.DELETE
      notificationHelper.addToNotificationForAll(req, res, notification, next)
      return res.status(HttpStatus.OK).json({ organization: org })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  archiveOrg: async (req, res, next) => {
    const { id } = req.params
    try {
      const org = await Organization.findById(id)
      if (!org) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ error: 'No such organization exists!' })
      }
      org.isArchived = true
      await org.save()
      return res.status(HttpStatus.OK).json({ organization: org })
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
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ error: 'No such organization exists!' })
      }
      // if user is admin or not
      const adminIds = organization.adminInfo.adminId
      const isAdmin = adminIds.indexOf(req.user.id) || req.user.isAdmin
      // user is admin then perform operation
      if (isAdmin !== -1 || req.user.isAdmin) {
        // toggle maintenance mode
        organization.isMaintenance = !organization.isMaintenance
        await organization.save()
        notification.tag = TAGS.MAINTENANCE

        if (organization.isMaintenance) {
          req.io.emit('org under maintenance', { data: organization.name })
          notification.heading = 'Maintenance mode on!'
          notification.content = `${organization.name} is kept under maintenance!`
          notificationHelper.addToNotificationForAll(req, res, notification, next)
          return res.status(HttpStatus.OK).json({
            maintenance: true,
            msg: 'Organization is kept under the maintenance!!'
          })
        }

        req.io.emit('org revoked maintenance', { data: organization.name })
        notification.heading = 'Maintenance mode off!'
        notification.content = `${organization.name} is revoked from maintenance!`
        return res.status(HttpStatus.OK).json({
          maintenance: false,
          msg: 'Organization is recovered from maintenance!!'
        })
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ msg: "You don't have access to triggerMaintenance!" })
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
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ msg: 'No Organization found!' })
      }
      const updates = Object.keys(req.body)
      const allowedUpdates = ['settings', 'permissions', 'authentication']
      // if admin then check if valid update
      if (req.user.isAdmin === true) {
        const isValidOperation = updates.every((update) => {
          return allowedUpdates.includes(update)
        })
        // if valid update
        if (isValidOperation) {
          updates.forEach((update) => {
            organization.options[update] = req.body[update]
          })
          await organization.save()
          return res.status(HttpStatus.OK).json({ organization })
        }
        // invalid update
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ msg: 'Invalid update' })
      }
      // else not admin
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ msg: "You don't have access to perform this operation!" })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  getOrgOverView: async (req, res, next) => {
    const orgOverView = {}
    try {
      const org = await Organization.find({})
      if (!org) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No org exists!' })
      }
      orgOverView.admins = org[0].adminInfo.length
      orgOverView.members = await User.find({}).lean().count()
      orgOverView.projects = await Project.find({}).lean().count()
      orgOverView.events = await Event.find({}).lean().count()
      return res.status(HttpStatus.OK).json({ orgOverView })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  // SEARCH FUNCTIONALITY
  getMembers: async (req, res, next) => {
    try {
      const { search } = req.query
      if (search) {
        const queryTerm = search.split(' ')
        const regex = new RegExp('^' + queryTerm + '$', 'i')
        const member = await User.find({
          $or: [
            { 'name.firstName': { $regex: regex } },
            { 'name.lastName': { $regex: regex } }
          ]
        }, {}, paginater.paginate(req))
          .select('name email isAdmin info.about.designation isRemoved createdAt')
          .lean()
          .sort({ createdAt: -1 })
          .exec()
        if (!member) {
          return res.status(HttpStatus.OK).json({ msg: 'Member not found!' })
        }
        return res.status(HttpStatus.OK).json({ member })
      } else {
        const members = await User.find({}, {}, paginater.paginate(req))
          .select('name email isAdmin info.about.designation isRemoved')
          .lean()
          .sort({ createdAt: -1 })
          .exec()
        if (members.length === 0) {
          return res
            .status(HttpStatus.OK)
            .json({ msg: 'No members joined yet!' })
        }
        return res.status(HttpStatus.OK).json({ members })
      }
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  // REMOVE ADMIN
  removeAdmin: async (req, res, next) => {
    try {
      const { userId, orgId } = req.params
      const org = await Organization.findById(orgId)
      if (!org) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No org exists!' })
      }
      // only permitted for admins
      if (!req.user.isAdmin) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ msg: 'You are not permitted!' })
      }
      // console.log('Permitted to removeAdmin')
      // REMOVE ADMINS FROM ADMINS LIST
      const admins = org.adminInfo.adminId
      const removableIndex = admins.indexOf(userId)
      if (removableIndex === -1) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ msg: 'User is not an admin!' })
      }
      // user is admin so remove
      org.adminInfo.adminId.splice(removableIndex, 1)
      await org.save()
      // also make isAdmin false
      const user = await User.findById(userId)
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No such user exists!' })
      }
      user.isAdmin = false
      await user.save()
      return res.status(HttpStatus.OK).json({ org })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // GET ORG LOGIN OPTIONS
  getOrgLoginOptions: async (req, res, next) => {
    try {
      const org = await Organisation.find({})
        .lean()
        .exec()
      if (org.length == 0) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'No such organization exists!' })
      }
      return res.status(HttpStatus.OK).json({ methods: org[0].options.authentication })
    } catch(error) {
      HANDLER.handleError(res, error)
    }
  }
}

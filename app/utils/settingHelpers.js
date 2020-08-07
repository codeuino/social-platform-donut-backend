const Organization = require('../models/Organisation')
const moment = require('moment')

module.exports = {
  isEnabledEmail: async () => {
    try {
      const org = await Organization.find({}).lean().exec()
      console.log('org ', org[0])
      // by default it's true
      if (org.length === 0) {
        return true
      }
      // check if allowed in org settings
      if (org[0].options.settings.enableEmail) {
        console.log('yes email isEnabledEmail')
        return true
      }
      // not allowed
      return false
    } catch (err) {
      console.log(err)
    }
  },
  canChangeName: async () => {
    try {
      const org = await Organization.find({}).lean().exec()
      console.log('org ', org[0])

      // by default it's true
      if (org.length === 0) {
        return true
      }
      // check if allowed in org settings
      if (org[0].options.permissions.canChangeName) {
        console.log('yes can canChangeName')
        return true
      }
      // not allowed
      return false
    } catch (error) {
      console.log(error)
    }
  },
  canChangeEmail: async () => {
    try {
      const org = await Organization.find({}).lean().exec()
      console.log('org ', org[0])

      // by default true
      if (org.length === 0) {
        return true
      }
      // check if allowed in org settings
      if (org[0].options.permissions.canChangeEmail) {
        console.log('yes can canChangeEmail')
        return true
      }
      // not allowed
      return false
    } catch (error) {
      console.log(error)
    }
  },
  canCreateOrManageUser: async () => {
    try {
      const org = await Organization.find({}).lean().exec()
      console.log('org ', org[0])
      if (org[0].options.permissions.canCreateManage) {
        return org[0].options.permissions.canCreateManage
      }
      return 'BOTH'
    } catch (error) {
      console.log(error)
    }
  },
  canSendInvite: async () => {
    try {
      const org = await Organization.find({}).lean().exec()
      // check if allowed
      if (org[0].options.permissions.sendInvite) {
        return org[0].options.permissions.sendInvite
      }
      return 'BOTH'
    } catch (error) {
      console.log(error)
    }
  },
  canEdit: async () => {
    try {
      const org = await Organization.find({}).lean().exec()
      if (org[0].options.settings.canEdit) {
        return true
      }
      // not allowed
      return false
    } catch (error) {
      console.log(error)
    }
  },
  isEditAllowedNow: async (createdAt) => {
    try {
      const org = await Organization.find({}).lean().exec()
      const limit = org[0].options.settings.editingLimit
      if (limit !== 'Always') {
        const now = moment().format('YYYY-MM-DD hh:mm:ss')
        const allowedTill = moment(createdAt).add(limit, 'minutes').format('YYYY-MM-DD hh:mm:ss')
        if (now < allowedTill) {
          return true
        }
        return false
      }
      // Always allowed
      return true
    } catch (error) {
      console.log(error)
    }
  },
  addAdmin: async (userId) => {
    try {
      const org = await Organization.find({})
      org[0].adminInfo.adminId.unshift(userId)
      await org[0].save()
    } catch (error) {
      console.log('error ', error)
    }
  }
}

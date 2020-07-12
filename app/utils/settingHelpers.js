const Organization = require('../models/Organisation')

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
      if (org[0].settings.options.enableEmail) {
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
  }
}

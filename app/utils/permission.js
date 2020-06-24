const HANDLER = require('../utils/response-helper')

module.exports = {
  check: async (req, res, creatorId = 0) => {
    const userId = req.user.id.toString()
    try {
      // if user is an admin
      if (req.user.isAdmin) {
        console.log('user is admin! ')
        return true
      }
      // if user is post/event/project/comment creator
      if (JSON.stringify(userId) === JSON.stringify(creatorId)) {
        console.log('user is creator!')
        return true
      }
      // else
      return false
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}

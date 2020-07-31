// Abstract class cannot be instantiated
class Middleware {
  constructor () {
    if (this.constructor === Middleware) {
      throw new Error("Can't instantiate abstract class!")
    }
  }

  static isUnderMaintenance = require('./maintenance')
  static isActivated = require('./activate')
  static auth = require('./auth')
}

module.exports = Middleware

const HttpStatus = require('http-status-codes')

class Auth {
  constructor (UserModel) {
    this.UserModel = UserModel
    this.#initBinding()
  }

  // PRIVATE ES6
  #initBinding = () => {
    this.authenticateUser = this.authenticateUser.bind(this)
    this.logout = this.logout.bind(this)
    this.logoutAll = this.logoutAll.bind(this)
  }

  async authenticateUser (req, res, next) {
    const email = req.body.email
    const password = req.body.password
    try {
      const user = await this.UserModel.findByCredentials(email, password)
      const token = await user.generateAuthToken()
      res.send({ user: user, token: token })
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message })
    }
  }

  logout (req, res, next) {
    res.status(HttpStatus.OK).json({ success: 'ok' })
  }

  logoutAll (req, res, next) {
    res.status(HttpStatus.OK).json({ success: 'ok' })
  }
}
module.exports = Auth

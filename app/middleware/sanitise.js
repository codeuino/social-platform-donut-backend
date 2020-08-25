const sanitize = require('mongo-sanitize')
module.exports = {
  cleanBody: (req, res, next) => {
    req.body = sanitize(req.body)
    next()
  }
}

const userModel = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const HttpStatus = require('http-status-codes')

module.exports = {
  create: function (req, res, next) {
    userModel.create({ name: req.body.name, email: req.body.email, password: req.body.password }, function (err, result) {
      if (err) {
        next(err)
      } else {
        res.status(HttpStatus.CREATED).json({ status: 'success', message: 'User added successfully!!!', data: null })
      }
    })
  },
  authenticate: function (req, res, next) {
    userModel.findOne({ email: req.body.email }, function (err, userInfo) {
      if (err) {
        next(err)
      } else {
        if (bcrypt.compareSync(req.body.password, userInfo.password)) {
          const token = jwt.sign({ id: userInfo._id }, req.app.get('secretKey'), { expiresIn: '1h' })
          res.status(HttpStatus.OK).json({ status: 'success', message: 'user found!!!', data: { user: userInfo, token: token } })
        } else {
          res.json({ status: 'error', message: 'Invalid email/password!!!', data: null })
        }
      }
    })
  },
  test: function (req, res, next) {
    res.json({ success: 'ulllu' })
  }
}

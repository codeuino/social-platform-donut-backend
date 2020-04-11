const User = require('../models/User')
const jwt = require('jsonwebtoken')
const STATUS = require('../utils/status-codes')

module.exports = {
  createUser: async (req, res, next) => {
    const user = new User(req.body)
    try {
      await user.save()
      const token = await user.generateAuthToken()
      // send email here, to activate the account
      res.status(STATUS.CREATED).json({ user: user, token: token })
    } catch (error) {
      console.log(error)
      res.status(STATUS.NOT_FOUND).json({ error: error })
    }
  },

  userProfile: async (req, res, next) => {
    res.json(req.user)
  },

  userProfileUpdate: async (req, res, next) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [
      'name',
      'email',
      'password',
      'company',
      'website',
      'location',
      'about'
    ]
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
      return res.status(STATUS.BAD_REQUEST).json({ error: 'invalid update' })
    }

    try {
      updates.forEach((update) => {
        req.user[update] = req.body[update]
      })
      await req.user.save()
      res.status(STATUS.UPDATED).json({ data: req.user })
    } catch (error) {
      res.status(STATUS.BAD_REQUEST).json({ error })
    }
  },

  forgotPasswordRequest: async (req, res) => {
    const { email } = req.body
    try {
      const user = await User.findOne({ email: email })
      if (!user) {
        res.status(STATUS.NOT_FOUND).json({ msg: 'User not found!' })
      }
      const token = jwt.sign({ _id: user._id, expiry: Date.now() + 10800000 }, process.env.JWT_SECRET)
      await user.save()
      return res.status(STATUS.OK).json({ success: true, token })
    } catch (error) {
      if (process.env.NODE_ENV !== 'production' && error) {
        console.log('Error in forgotPasswordRequest ', error)
      }
      res.status(STATUS.BAD_REQUEST).json({ error })
    }
  },

  updatePassword: async (req, res) => {
    const { password, id } = req.body
    const { token } = req.params
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

      if (Date.now() <= decodedToken.expiry) {
        const user = await User.findById({
          _id: id
        })
        if (!user) {
          return res.status(400).json({ msg: 'No such user' })
        }
        user.password = password
        await user.save()
        return res.status(STATUS.OK).json({ updated: true })
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log('token expired')
        }
        res.status(STATUS.BAD_REQUEST).json({ error: 'Token expired' })
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production' && error) {
        console.log('Something went wrong ', error)
      }
      res.status(STATUS.BAD_REQUEST).json({ error })
    }
  },

  logout: (req, res, next) => {
    res.json({ success: 'ok' })
  },

  userDelete: async (req, res, next) => {
    try {
      await req.user.remove()
      res.send({ data: 'user deletion successful', user: req.user })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error })
    }
  },

  activateAccount: async (req, res, next) => {
    try {
      const { token } = req.params
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      const expiryTime = decodedToken.iat + 10800000 // 24 hrs
      if (expiryTime <= Date.now()) {
        const user = await User.findById(decodedToken._id)
        if (!user) {
          res.status(404).json({ msg: 'User not found!' })
        }
        // if user found activate the account
        user.isActivated = true
        await user.save()
        return res.status(201).json({ user: user })
      }
    } catch (Error) {
      if (process.env.NODE_ENV !== 'production' && Error) {
        console.log('Error in activateAccount ', Error)
      }
      return res.status(400).json({ Error: Error })
    }
  }
}

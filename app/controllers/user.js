const User = require('../models/User')

module.exports = {
  createUser: async (req, res, next) => {
    const user = new User(req.body)
    try {
      await user.save()
      const token = await user.generateAuthToken()
      res.status(201).json({ user: user, token: token })
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error })
    }
  },
  userProfile: async (req, res, next) => {
    res.json(req.user)
  },
  userProfileUpdate: async (req, res, next) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password']
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
      return res.status(400).json({ error: 'invalid update' })
    }

    try {
      updates.forEach((update) => {
        req.user[update] = req.body[update]
      })
      await req.user.save()
      res.status(200).json({ data: req.user })
    } catch (error) {
      res.status(400).json({ error })
    }
  },
  userDelete: async (req, res, next) => {
    try {
      await req.user.remove()
      res.send({ data: 'user deletetion successful', user: req.user })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error })
    }
  }
}

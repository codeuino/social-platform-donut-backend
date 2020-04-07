const sharp = require('sharp')
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
    const allowedUpdates = ['name', 'email', 'password', 'company', 'website', 'location', 'about']
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
  },
  uploadUserImage: async (req, res, next) => {
    try {
      const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
      req.user.avatar = buffer
      await req.user.save()
      res.send('Image uploaded successfully')
    } catch (error) {
      res.status(400).json({ error })
    }
  },
  deleteUserImage: async (req, res, next) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send('Image deleted successfully')
  },
  getUserImage: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id)
      if (!user) {
        throw new Error('There is no such user')
      }
      res.set('Content-Type', 'image/png')
      res.send(user.avatar)
    } catch (error) {
      res.status(400).json({ error })
    }
  }
}

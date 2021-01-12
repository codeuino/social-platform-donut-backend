const User = require('../models/User')
const jwt = require('jsonwebtoken')
const HttpStatus = require('http-status-codes')
const emailController = require('./email')
const permission = require('../utils/permission')
const HANDLER = require('../utils/response-helper')
const notificationHelper = require('../utils/notif-helper')
const Projects = require('../models/Project')
const Events = require('../models/Event')
const Organization = require('../models/Organisation')
const TAGS = require('../utils/notificationTags')
const settingHelper = require('../utils/settingHelpers')
const Activity = require('../models/Activity')
const activityHelper = require('../utils/activity-helper')
const formatUser = require('../utils/format-user')

const notification = {
  heading: '',
  content: '',
  tag: ''
}

module.exports = {
  // CREATE USER
  createUser: async (req, res, next) => {
    try {
      const { password } = req.body
      if(!password) throw new Error("Password is required")

      const user = new User(req.body)
      const isRegisteredUserExists = await User.findOne({ firstRegister: true })
      const Org = await Organization.find({}).lean().exec()
      // for the first user who will be setting up the platform for their community
      if (!isRegisteredUserExists) {
        user.isAdmin = true
        user.firstRegister = true
      }
      if (Org.length > 0) {
        user.orgId = Org[0]._id
      }
      const data = await user.save()
      if (!isRegisteredUserExists || req.body.isAdmin === true) {
        settingHelper.addAdmin(data._id)
      }
      const token = await user.generateAuthToken()
      // Added fn to send email to activate account with warm message
      await emailController.sendEmail(req, res, next, token)

      // create redis db for activity for the user
      const activity = new Activity({ userId: data._id })
      await activity.save()
      // hide password
      user.password = undefined
      res.cookie('token', token, { httpOnly: true }).status(HttpStatus.CREATED).send({ user: user })
    } catch (error) {
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({ error: error })
    }
  },
  // GET USER PROFILE
  userProfile: async (req, res, next) => {
    try {
      const id = req.params.id || req.user._id
      const user = await User.findById(id)
        .populate('followings', [
          'name.firstName',
          'name.lastName',
          'info.about.designation',
          '_id',
          'isAdmin'
        ])
        .populate('followers', [
          'name.firstName',
          'name.lastName',
          'info.about.designation',
          '_id',
          'isAdmin'
        ])
        .populate('blocked', [
          'name.firstName',
          'name.lastName',
          'info.about.designation',
          '_id',
          'isAdmin'
        ])
        .exec()
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No such user exist!' })
      }
      // hide password and tokens
      user.password = undefined
      user.tokens = []
      return res.status(HttpStatus.OK).json({ user })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  // Load User
  loadUser: async (req, res, next) => {
    try {
      const id = req.params.id || req.user._id
      const user = await User.findById(id)
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No such user exist!' })
      }
      // hide password and tokens
      user.password = undefined
      user.tokens = []
      return res.status(HttpStatus.OK).json({ user: user })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // USER PROFILE UPDATE
  userProfileUpdate: async (req, res, next) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [
      'phone',
      'info',
      'about',
      'socialMedia',
      'isDeactivated'
    ]
    // added control as per org settings
    if (settingHelper.canChangeName()) {
      allowedUpdates.unshift('name')
    }
    if (settingHelper.canChangeEmail()) {
      allowedUpdates.unshift('email')
    }
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'invalid update' })
    }

    try {
      const { id } = req.params
      const user = await User.findById(id)
      updates.forEach((update) => {
        user[update] = req.body[update]
      })
      await user.save()
      // hide password and tokens
      user.password = undefined
      user.tokens = []
      return res.status(HttpStatus.OK).json({ data: user })
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error })
    }
  },

  // FORGOT PASSWORD REQUEST
  forgotPasswordRequest: async (req, res) => {
    const { email } = req.body
    try {
      const user = await User.findOne({ email: email })
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'User not found!' })
      }
      const token = jwt.sign({ _id: user._id, expiry: Date.now() + 10800000 }, user.password)
      await user.save()
      return res.status(HttpStatus.OK).json({ success: true, token })
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error })
    }
  },

  updatePassword: async (req, res, next) => {
    const { password, id } = req.body
    const { token } = req.params
    let preChange = true;
    try {
      const user = await User.findById(id)
      const decodedToken = jwt.verify(token, user.password, err => {
        if (err){
          preChange = false;
          return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Token Expired' })
        }
      })

      if (Date.now() <= decodedToken.expiry) {
        if (!user) {
          return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'No such user' })
        }
        user.password = password
        await user.save()
        const obj = {
          userId: user._id
        }
        req.io.emit('Password update', obj)
        notification.heading = 'Forgot password!'
        notification.content = 'Password successfully updated!'
        notification.tag = TAGS.UPDATE
        await notificationHelper.addToNotificationForUser(id, res, notification, next)
        return res.status(HttpStatus.OK).json({ updated: true })
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ error: 'Token expired' })
      }
    } catch (error) {
      if(preChange)
        res.status(HttpStatus.BAD_REQUEST).json({ error })
    }
  },

  // LOGOUT USER
  logout: async (req, res, next) => {
    try {
      req.user.tokens = []
      await req.user.save()
      // add all activity to db after successfully logged out
      activityHelper.addActivityToDb(req, res)
      res.clearCookie('token')
      return res.status(HttpStatus.OK).json({ msg: 'User logged out Successfully!' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // REMOVE USER
  userDelete: async (req, res, next) => {
    try {
      if (permission.check(req, res)) {
        await req.user.remove()
        return res.send({ data: 'user deletion successful', user: req.user })
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'You don\'t have permission!' })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error })
    }
  },

  // USER ACCOUNT ACTIVATION
  activateAccount: async (req, res, next) => {
    try {
      const { token } = req.params
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      const expiryTime = decodedToken.iat + 24 * 3600 * 1000 // 24 hrs
      if (expiryTime <= Date.now()) {
        const user = await User.findById(decodedToken._id)
        if (!user) {
          return res.status(HttpStatus.NOT_FOUND).json({ msg: 'User not found!' })
        }
        // if user found activate the account
        user.isActivated = true
        await user.save()
        const obj = {
          userId: user._id
        }
        req.io.emit('Account activate', obj)
        notification.heading = 'Account activate!'
        notification.content = 'Account successfully activated!'
        notification.tag = TAGS.ACTIVATE
        await notificationHelper.addToNotificationForUser(user._id, res, notification, next)
        return res.status(HttpStatus.OK).json({ msg: 'Succesfully activated!' })
      }
    } catch (Error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ Error })
    }
  },

  // GET INVITE LINK
  getInviteLink: async (req, res, next) => {
    try {
      const { role } = req.query
      const token = jwt.sign({ _id: req.user._id, role: role, expiry: Date.now() + 24 * 3600 * 1000 }, process.env.JWT_SECRET)
      const inviteLink = `${req.protocol}://${req.get('host')}/user/invite/${token}`
      return res.status(HttpStatus.OK).json({ inviteLink: inviteLink })
    } catch (error) {
      console.log('error in req', error)
      HANDLER.handleError(res, error)
    }
  },

  // PROCESS THE INVITE LINK
  processInvite: async (req, res, next) => {
    try {
      const { token } = req.params
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      // check if token not expired and sender exist in db then valid request
      const user = await User.findById(decodedToken._id)
      if (user && Date.now() <= decodedToken.expiry) {
        console.log('Valid invite!')
        if (decodedToken.role === 'user') {
          // TODO: CHANGE THE URL IN PRODUCTION (in env file)
          return res.redirect(process.env.clientbaseurl)
        }
        if (decodedToken.role === 'admin') {
          // TODO: CHANGE THE URL IN PRODUCTION (in env file)
          return res.redirect(`${process.env.clientbaseurl}/admin`)
        }
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'Invalid token!' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // ADD TO THE FOLLOWINGS LIST
  addFollowing: async (req, res, next) => {
    const { id } = req.params
    try {
      if (id === req.user._id) {
        return res.status(HttpStatus.OK).json({ msg: 'You can not follow yourself!' })
      }
      const user = await User.findById(req.user.id)
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'No such user exists!' })
      }
      if (user.followings.indexOf(id) >= 0)
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'You are already following the user' })
      user.followings.unshift(id)
      await user.save()
      next()
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // ADD TO FOLLOWERS LIST
  addFollower: async (req, res, next) => {
    console.log('follow request!')
    const { id } = req.params
    try {
      const user = await User.findById(id)
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'No such user exists!' })
      }
      // add to the followers list
      user.followers.unshift(req.user.id)
      await user.save()
      const obj = {
        name: req.user.name.firstName,
        followId: user._id
      }
      req.io.emit('New follower', obj)
      notification.heading = 'New follower!'
      notification.content = `${req.user.name.firstName} started following you!`
      notification.tag = TAGS.FOLLOWER
      await notificationHelper.addToNotificationForUser(user._id, res, notification, next)
      const userData = await User.findById(req.user._id)
        .populate('followings', ['name.firstName', 'name.lastName', 'info.about.designation', '_id', 'isAdmin'])
        .populate('followers', ['name.firstName', 'name.lastName', 'info.about.designation', '_id', 'isAdmin'])
        .populate('blocked', ['name.firstName', 'name.lastName', 'info.about.designation', '_id', 'isAdmin'])
        .exec()
      // hide password and tokens
      userData.password = undefined
      userData.tokens = []
      return res.status(HttpStatus.OK).json({ user: userData })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // REMOVE FROM FOLLOWINGS LIST
  removeFollowing: async (req, res, next) => {
    const { id } = req.params
    try {
      const user = await User.findById(req.user._id)
      if (!user) {
        return res.status(HttpStatus.OK).json({ msg: 'No such user exists!' })
      }
      // check if followId is in following list or not
      const followingIdArray = user.followings.map(followingId => followingId._id)
      const isFollowingIdIndex = followingIdArray.indexOf(id)
      if (isFollowingIdIndex === -1) {
        return res.status(HttpStatus.OK).json({ msg: 'You haven\'t followed the user!' })
      } else {
        // remove from followings list
        user.followings.splice(isFollowingIdIndex, 1)
        await user.save()
      }
      next()
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // REMOVE FROM FOLLOWERS LIST
  removeFollower: async (req, res, next) => {
    const { id } = req.params
    try {
      const user = await User.findById(id)
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No such user exists!' })
      }
      const followersIdArray = user.followers.map((follower) => follower._id)
      const isFollowingIndex = followersIdArray.indexOf(req.user._id)
      if (isFollowingIndex === -1) {
        return res.status(HttpStatus.OK).json({ msg: 'User is not following!' })
      }
      user.followers.splice(isFollowingIndex, 1)
      await user.save()
      const userData = await User.findById(req.user._id)
        .populate('followings', ['name.firstName', 'name.lastName', 'info.about.designation', '_id', 'isAdmin'])
        .populate('followers', ['name.firstName', 'name.lastName', 'info.about.designation', '_id', 'isAdmin'])
        .populate('blocked', ['name.firstName', 'name.lastName', 'info.about.designation', '_id', 'isAdmin'])
        .exec()
      // hide password and tokens
      userData.password = undefined
      userData.tokens = []
      return res.status(HttpStatus.OK).json({ user: userData })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // BLOCK THE USER
  blockUser: async (req, res, next) => {
    const { id } = req.params
    try {
      const user = await User.findById(req.user._id)
        .populate('blocked', ['name.firstName', 'name.lastName', 'email'])
        .exec()
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'Invalid request!' })
      }
      // check if admin
      if (user.isAdmin === true) {
        user.blocked.unshift(id)
        await user.save()
        return res.status(HttpStatus.OK).json({ user })
      }
      // else not permitted
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'You don\'t have permission!' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // UNBLOCK USER
  unBlockUser: async (req, res, next) => {
    const { id } = req.params
    try {
      const user = await User.findById(req.user._id)
        .populate('blocked', ['name.firstName', 'name.lastName', 'email'])
        .exec()
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No such user exists!' })
      }
      // if admin
      if (user.isAdmin === true) {
        const blockedIds = user.blocked.map(item => item._id)
        const unblockIndex = blockedIds.indexOf(id)
        if (unblockIndex !== -1) {
          user.blocked.splice(unblockIndex, 1)
          await user.save()
          // hide password and tokens
          user.password = undefined
          user.tokens = []
          return res.status(HttpStatus.OK).json({ user })
        }
        return res.status(HttpStatus.NOT_FOUND).json({ user })
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'You don\'t have permission!' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  // GET OVERALL PERSONAL OVERVIEW
  getPersonalOverview: async (req, res, next) => {
    const userId = req.user.id
    const personalOverview = {}
    try {
      personalOverview.projects = await Projects.find({ createdBy: userId })
      personalOverview.events = await Events.find({ createdBy: userId })
      personalOverview.projects = personalOverview.projects.length
      personalOverview.events = personalOverview.events.length
      return res.status(HttpStatus.OK).json({ personalOverview })
    } catch (error) {
      HANDLER.handleError(req, error)
    }
  },

  // REMOVE USER
  removeUser: async (req, res, next) => {
    const { id } = req.params
    try {
      const user = await User.findById(id)
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No such user exits!' })
      }
      // only admins can remove
      if (!req.user.isAdmin) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'You are not permitted!' })
      }
      user.isRemoved = true
      await user.save()
      // hide password and tokens
      user.password = undefined
      user.tokens = []
      return res.status(HttpStatus.OK).json({ user })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },
  // DEACTIVATE ACCOUNT (BY USER ITSELF)
  deactivateAccount: async (req, res, next) => {
    try {
      req.user.isActivated = !req.user.isActivated
      const user = await req.user.save()
      // hide password and tokens
      user.password = undefined
      user.tokens = []
      return res.status(HttpStatus.OK).json({ user })
    } catch (error) {
      HANDLER.handleError(error)
    }
  },
  // Find User and Create if doesn't exist
  findOrCreateForOAuth: async(profile, provider) => {
    let user = formatUser.formatUser(profile, provider)
    try {
      const existingUser = await User.findOne({
        email: user.email
      })
      if (existingUser) {
        const token = await existingUser.generateAuthToken()
        return  {token, user: existingUser}
      } else {
        const newUser = new User(user)
        const isRegisteredUserExists = await User.findOne({ firstRegister: true })
        const Org = await Organization.find({}).lean().exec()
        // for the first user who will be setting up the platform for their community
        if (!isRegisteredUserExists) {
          newUser.isAdmin = true
          newUser.firstRegister = true
        }
        if (Org.length > 0) {
          newUser.orgId = Org[0]._id
        }
        const data = await newUser.save()
        if (!isRegisteredUserExists) {
          settingHelper.addAdmin(data._id)
        }
        const token = await newUser.generateAuthToken()

        // create redis db for activity for the user
        const activity = new Activity({ userId: data._id })
        await activity.save()
        // hide password
        data.password = undefined
        return {token: token, user: data}
      }
    } catch(e) {
      throw e
    }
  }
}

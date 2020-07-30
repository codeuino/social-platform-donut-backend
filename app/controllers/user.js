const jwt = require('jsonwebtoken')
const HttpStatus = require('http-status-codes')
const emailController = require('./email')
const permission = require('../utils/permission')
const HANDLER = require('../utils/response-helper')
const notificationHelper = require('../utils/notif-helper')
const TAGS = require('../utils/notificationTags')
const settingHelper = require('../utils/settingHelpers')
const Notification = require('../utils/notificationClass')

class UserController extends Notification {
  constructor (User, Event, Project, Organisation) {
    super()
    this.#initModels(User, Event, Project, Organisation)
    this.#initBinding()
  }

  // INIT MODELS (PRIVATE)
  #initModels = (UserModel, EventModel, ProjectModel, OrganisationModel) => {
    this.UserModel = UserModel
    this.EventModel = EventModel
    this.ProjectModel = ProjectModel
    this.OrganisationModel = OrganisationModel
  }

  // BINDERS (PRIVATE)
  #initBinding = () => {
    this.createUser = this.createUser.bind(this)
    this.userProfile = this.userProfile.bind(this)
    this.userDelete = this.userDelete.bind(this)
    this.activateAccount = this.activateAccount.bind(this)
    this.addFollower = this.addFollower.bind(this)
    this.addFollowing = this.addFollowing.bind(this)
    this.removeFollower = this.removeFollower.bind(this)
    this.removeFollowing = this.removeFollowing.bind(this)
    this.blockUser = this.blockUser.bind(this)
    this.unBlockUser = this.unBlockUser.bind(this)
    this.deactivateAccount = this.deactivateAccount.bind(this)
    this.getInviteLink = this.getInviteLink.bind(this)
    this.processInvite = this.processInvite.bind(this)
    this.forgotPasswordRequest = this.forgotPasswordRequest.bind(this)
    this.getPersonalOverview = this.getPersonalOverview.bind(this)
    this.logout = this.logout.bind(this)
    this.updatePassword = this.updatePassword.bind(this)
  }

  // CREATE USER
  async createUser (req, res, next) {
    const user = new this.UserModel(req.body)
    try {
      const isRegisteredUserExists = await this.UserModel.findOne({ firstRegister: true })
      const Org = await this.OrganisationModel.find({}).lean().exec()
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
      return res.status(HttpStatus.CREATED).json({ user: user, token: token })
    } catch (error) {
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({ error: error })
    }
  }

  // GET USER PROFILE
  async userProfile (req, res, next) {
    try {
      const user = req.user
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No such user exist!' })
      }
      return res.status(HttpStatus.OK).json({ user })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  // USER PROFILE UPDATE
  async userProfileUpdate (req, res, next) {
    const updates = Object.keys(req.body)
    const allowedUpdates = [
      'phone',
      'info',
      'about',
      'socialMedia'
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
      updates.forEach((update) => {
        req.user[update] = req.body[update]
      })
      await req.user.save()
      return res.status(HttpStatus.OK).json({ data: req.user })
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error })
    }
  }

  // FORGOT PASSWORD REQUEST
  async forgotPasswordRequest (req, res) {
    const { email } = req.body
    try {
      const user = await this.UserModel.findOne({ email: email })
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'User not found!' })
      }
      const token = jwt.sign({ _id: user._id, expiry: Date.now() + 10800000 }, process.env.JWT_SECRET)
      await user.save()
      return res.status(HttpStatus.OK).json({ success: true, token })
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error })
    }
  }

  async updatePassword (req, res, next) {
    const { password, id } = req.body
    const { token } = req.params
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

      if (Date.now() <= decodedToken.expiry) {
        const user = await this.UserModel.findById({
          _id: id
        })
        if (!user) {
          return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'No such user' })
        }
        user.password = password
        await user.save()
        const obj = {
          userId: user._id
        }
        req.io.emit('Password update', obj)
        const newNotif = this.pushNotification(
          'Forgot password!',
          'Password successfully updated!',
          TAGS.UPDATE)
        await notificationHelper.addToNotificationForUser(id, res, newNotif, next)
        return res.status(HttpStatus.OK).json({ updated: true })
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ error: 'Token expired' })
      }
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ error })
    }
  }

  // LOGOUT USER
  async logout (req, res, next) {
    try {
      req.user.tokens = []
      await req.user.save()
      return res.status(HttpStatus.OK).json({ msg: 'User logged out Successfully!' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  // REMOVE USER
  async userDelete (req, res, next) {
    try {
      if (permission.check(req, res)) {
        await req.user.remove()
        return res.send({ data: 'user deletion successful', user: req.user })
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'You don\'t have permission!' })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error })
    }
  }

  // USER ACCOUNT ACTIVATION
  async activateAccount (req, res, next) {
    try {
      const { token } = req.params
      const decodedToken = jwt.verify(token, 'process.env.JWT_SECRET')
      const expiryTime = decodedToken.iat + 24 * 3600 * 1000 // 24 hrs
      if (expiryTime <= Date.now()) {
        const user = await this.UserModel.findById(decodedToken._id)
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
        const newNotif = this.pushNotification(
          'Account activate!',
          'Account successfully activated!',
          TAGS.ACTIVATE
        )
        await notificationHelper.addToNotificationForUser(user._id, res, newNotif, next)
        return res.status(HttpStatus.OK).json({ msg: 'Succesfully activated!' })
      }
    } catch (Error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ Error })
    }
  }

  // GET INVITE LINK
  async getInviteLink (req, res, next) {
    try {
      const { role } = req.query
      const token = jwt.sign({ _id: req.user._id, role: role, expiry: Date.now() + 24 * 3600 * 1000 }, process.env.JWT_SECRET)
      const inviteLink = `${req.protocol}://${req.get('host')}/user/invite/${token}`
      return res.status(HttpStatus.OK).json({ inviteLink: inviteLink })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  // PROCESS THE INVITE LINK
  async processInvite (req, res, next) {
    try {
      const { token } = req.params
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      // check if token not expired and sender exist in db then valid request
      const user = await this.UserModel.findById(decodedToken._id)
      if (user && Date.now() <= decodedToken.expiry) {
        console.log('Valid invite!')
        if (decodedToken.role === 'user') {
          // TODO: CHANGE THE URL IN PRODUCTION (in env file)
          return res.redirect(process.env.clientbaseurl)
        }
        if (decodedToken.role === 'admin') {
          // TODO: CHANGE THE URL IN PRODUCTION (in env file)
          return res.redirect(`${process.env.clientbaseurl}admin`)
        }
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'Invalid token!' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  // ADD TO THE FOLLOWINGS LIST
  async addFollowing (req, res, next) {
    const { followId } = req.body
    try {
      if (followId === req.user._id) {
        return res.status(HttpStatus.OK).json({ msg: 'You can not follow yourself!' })
      }
      const user = await this.UserModel.findById(req.user.id)
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'No such user exists!' })
      }
      user.followings.unshift(followId)
      await user.save()
      next()
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  // ADD TO FOLLOWERS LIST
  async addFollower (req, res, next) {
    const { followId } = req.body
    try {
      const user = await this.UserModel.findById(followId)
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
      const newNotif = this.pushNotification(
        'New follower!',
        `${req.user.name.firstName} started following you!`,
        TAGS.FOLLOWER
      )
      await notificationHelper.addToNotificationForUser(user._id, res, newNotif, next)
      const userData = await this.UserModel.findById(req.user._id)
        .populate('followings', ['name.firstName', 'name.lastName', 'info.about.designation', '_id', 'isAdmin'])
        .populate('followers', ['name.firstName', 'name.lastName', 'info.about.designation', '_id', 'isAdmin'])
        .populate('blocked', ['name.firstName', 'name.lastName', 'info.about.designation', '_id', 'isAdmin'])
        .exec()
      return res.status(HttpStatus.OK).json({ user: userData })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  // REMOVE FROM FOLLOWINGS LIST
  async removeFollowing (req, res, next) {
    const { followId } = req.body
    try {
      const user = await this.UserModel.findById(req.user._id)
      if (!user) {
        return res.status(HttpStatus.OK).json({ msg: 'No such user exists!' })
      }
      // check if followId is in following list or not
      const followingIdArray = user.followings.map(followingId => followingId._id)
      const isFollowingIdIndex = followingIdArray.indexOf(followId)
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
  }

  // REMOVE FROM FOLLOWERS LIST
  async removeFollower (req, res, next) {
    const { followId } = req.body
    try {
      const user = await this.UserModel.findById(followId)
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
      const userData = await this.UserModel.findById(req.user._id)
        .populate('followings', ['name.firstName', 'name.lastName', 'info.about.designation', '_id', 'isAdmin'])
        .populate('followers', ['name.firstName', 'name.lastName', 'info.about.designation', '_id', 'isAdmin'])
        .populate('blocked', ['name.firstName', 'name.lastName', 'info.about.designation', '_id', 'isAdmin'])
        .exec()
      return res.status(HttpStatus.OK).json({ user: userData })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  // BLOCK THE USER
  async blockUser (req, res, next) {
    const { id } = req.params
    try {
      const user = await this.UserModel.findById(req.user._id)
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
  }

  // UNBLOCK USER
  async unBlockUser (req, res, next) {
    const { id } = req.params
    try {
      const user = await this.UserModel.findById(req.user._id)
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
          return res.status(HttpStatus.OK).json({ user })
        }
        return res.status(HttpStatus.NOT_FOUND).json({ user })
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'You don\'t have permission!' })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  // GET OVERALL PERSONAL OVERVIEW
  async getPersonalOverview (req, res, next) {
    const userId = req.user._id
    const personalOverview = {}
    try {
      personalOverview.projects = await this.ProjectModel.find({ createdBy: userId }).estimatedDocumentCount()
      personalOverview.events = await this.EventModel.find({ createdBy: userId }).estimatedDocumentCount()
      return res.status(HttpStatus.OK).json({ personalOverview })
    } catch (error) {
      HANDLER.handleError(req, error)
    }
  }

  // REMOVE USER
  async removeUser (req, res, next) {
    const { id } = req.params
    try {
      const user = await this.UserModel.findById(id)
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ msg: 'No such user exits!' })
      }
      // only admins can remove
      if (!req.user.isAdmin) {
        return res.status(HttpStatus.BAD_REQUEST).json({ msg: 'You are not permitted!' })
      }
      user.isRemoved = true
      await user.save()
      return res.status(HttpStatus.OK).json({ user })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }

  // DEACTIVATE ACCOUNT (BY USER ITSELF)
  async deactivateAccount (req, res, next) {
    try {
      req.user.isActivated = !req.user.isActivated
      const user = await req.user.save()
      return res.status(HttpStatus.OK).json({ user })
    } catch (error) {
      HANDLER.handleError(error)
    }
  }
}

module.exports = UserController

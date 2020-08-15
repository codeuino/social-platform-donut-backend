const User = require('../models/User')
const redis = require('../../config/redis')

const activity = async (req, res, next) => {
  var redisClient = redis.redisClient
  var route = req.originalUrl.replace(/\?.*$/, '')
  var method = req.method
  var userID = req.user.id.toString()
  console.log('req.body ', req.body)
  console.log('res.locals.data ', res.locals.data)
  console.log('route ', route)
  console.log('methods ', method)

  if (route === '/user/logout') {
    var activityData = await redisClient.lrange(userID, 0, -1)
    const data = await User.findOne({
      _id: userID
    })
    var activityElement = {
      route: '',
      method: '',
      collectionType: '',
      id: '',
      timestamp: ''
    }
    for (let index = 0; index < activityData.length; index++) {
      var activityDataElement = activityData[index].split(',')
      activityElement.route = activityDataElement[0]
      activityElement.method = activityDataElement[1]
      activityElement.collectionType = activityDataElement[2]
      activityElement.id = activityDataElement[3]
      activityElement.timestamp = activityDataElement[4]
      data.activity.unshift(activityElement)
    }
    await data.update()
    console.log('DATA')
    console.log(data)
    // clear data from redis
    await redisClient.del(userID)
  } else if (method !== 'GET') {
    var objectID = res.locals.data._id
    userID = objectID
    var timeStamp = Date()
    var collectionType = res.locals.collectionType
    if (typeof res.locals.data.userId !== 'undefined') {
      userID = res.locals.data.userId
    }
    // example /auth/login,POST,user,5ed09e9d446f2b1c208b6ba8,Thu Jul 23 2020 20:28:29 GMT+0530 (India Standard Time)
    activityElement = route.concat(',', method, ',', collectionType, ',', objectID, ',', timeStamp)
    // userID => [(route, collection, method, objectID), (route,method, collection, objectID) ...]
    await redisClient.rpush(userID, activityElement)
    next()
  }
}

module.exports = activity

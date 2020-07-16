const User = require('../models/User')
const redis = require('../../config/redis')
const activity = async (req, res, next) => {
  var redisClient = redis.redisClient
  var route = req.originalUrl.replace(/\?.*$/, '')
  if (route === '/user/logout') {
    var userID = req.user.id.toString()
    var activityData = await redisClient.lrange(userID, 0, -1)
    const data = await User.findOne({
      _id: userID
    })
    var activityElement = {
      route: "",
      method: "",
      collectionType: "",
      id: "",
    }
    for (let index = 0; index < activityData.length; index++) {
      var activityDataElement = activityData[index].split(',')
      activityElement.route = activityDataElement[0]
      activityElement.method = activityDataElement[1]
      activityElement.collectionType = activityDataElement[2]
      activityElement.id = activityDataElement[3]
      data.activity.push(activityElement)
    }
    await data.update()
    console.log("DATA")
    console.log(data)
    // clear data from redis
    await redisClient.del(userID)
  } else if (method != 'GET') {
    var objectID = res.locals.data._id
    var method = req.method
    var userID = objectID
    var collectionType = res.locals.collectionType
    if (typeof res.locals.data.userId !== 'undefined') {
      userID = res.locals.data.userId
    }
    // example /auth/login,POST,user,5ed09e9d446f2b1c208b6ba8
    var activityElement = route.concat(",", method, ",", collectionType, ",", objectID)
    // userID => [(route, collection, method, objectID), (route,method, collection, objectID) ...]
    await redisClient.rpush(userID, activityElement)

  }
}

module.exports = activity

const User = require('../models/User')
const redis = require('../../config/redis')
const activity = async (req, res, next) => {
  var redisClient = redis.redisClient
  var route = req.originalUrl.replace(/\?.*$/, '')
  if (route === '/user/logout') {
    // Fetch data from redis
    const token = req.token
    var routeNamesDict
    var mailid
    const data = await User.findOne({
      'tokens.token': token
    })
    mailid = String(data.email)
    if (!mailid) {
      throw new Error()
    }
    routeNamesDict = await redisClient.hgetall(mailid)
    let key, value
    for (key in routeNamesDict) {
      value = routeNamesDict[key]
      var timeStampSet = await redisClient.smembers(String(value))
      var activityData = {
        routeName: String(key),
        route: timeStampSet
      }
      var activityLength = data.activity.length
      if (activityLength === 0) {
        data.activity.push(activityData)
      } else {
        var routeIndex = null
        for (let index1 = 0; index1 < data.activity.length; index1++) {
          if (data.activity[index1].routeName === key) {
            routeIndex = index1
          }
        }
        if (routeIndex === null) {
          data.activity.push(activityData)
        } else {
          var tempTimeStamps = data.activity[routeIndex].route
          if (tempTimeStamps.length > 0) {
            tempTimeStamps.push(...timeStampSet)
            data.activity[routeIndex].route.push(...tempTimeStamps)
          } else {
            data.activity[routeIndex].route.push(...timeStampSet)
          }
        }
      }
    }
    await data.update()
    if (process.env.NODE_ENV !== 'production') {
      console.log(data)
    }
    // Deleting data from Redis
    routeNamesDict = await redisClient.hgetall(mailid)
    // delete all sets
    for (k in routeNamesDict) {
      var val = routeNamesDict[k]
      await redisClient.del(val)
    }
    // delete complete user hash
    await redisClient.del(mailid)
  } else {
    const { email } = req.body
    const timeStamp = new Date(Date.now())
    var uniqueHash = ''
    redisClient.hget(email, route).then(function (value) {
      if (value !== null) { uniqueHash = value } else {
        uniqueHash = timeStamp.toISOString().concat(email)
        redisClient.hset(email, route, uniqueHash)
      }
      redisClient.sadd(uniqueHash, timeStamp.toString())
    })
  }
  next()
}

module.exports = activity

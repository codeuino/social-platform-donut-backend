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
    console.log(routeNamesDict)
    for (key in routeNamesDict) {
      console.log(key)
      value = routeNamesDict[key]
      console.log(value)
      var timeStampSet = await redisClient.smembers(String(value))
      console.log("Time stamp set")
      console.log(timeStampSet)
      var activityData = {
        routeName: String(key),
        route: Array(timeStampSet)
      }
      var activityLength = data.activity.length
      console.log('act len')
      console.log(activityLength)
      console.log('activities')
      console.log(data.activity)
      if (activityLength === 0) {
        data.activity.push(activityData)
      } else {
        var filterData = data.activity.filter(activity => activity.routeName === key)
        if (filterData.length === 0) {
          data.activity.push(activityData)
        } else {
          var tempTimeStamps = data.activity.route
          if (tempTimeStamps) {
            tempTimeStamps.concat(timeStampSet)
            for (let index = 0; index < tempTimeStamps.length; index++) {
              data.activity.route.push(tempTimeStamps[index])
            }
          } else {
            data.activity.route = []
            for (let index = 0; index < timeStampSet.length; index++) {
              data.activity.route.push(timeStampSet[index])
            }
          }
        }
      }
    }
    await data.save()
    console.log(data)
  } else {
    const { email } = req.body
    const timeStamp = new Date(Date.now())
    if (process.env.NODE_ENV !== 'production') {
      console.log('User: '.concat(String(email)))
      console.log('Route: '.concat(String(route)))
      console.log('TimeStamp: '.concat(timeStamp.toString()))
    }
    var uniqueHash = ''
    redisClient.hget(email, route).then(function (value) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(value)
      }
      if (value !== null) { uniqueHash = value } else {
        uniqueHash = timeStamp.toISOString().concat(email)
        console.log('New hash:'.concat(uniqueHash))
        redisClient.hset(email, route, uniqueHash)
      }
      redisClient.sadd(uniqueHash, timeStamp.toString())
    })
  }
  next()
}

module.exports = activity

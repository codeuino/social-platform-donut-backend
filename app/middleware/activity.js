const User = require('../models/User')
const redis = require('../../config/redis')
const activity = async (req, res, next) => {
  var redisClient = redis.redisClient
  var route = req.originalUrl.replace(/\?.*$/, '')
  if (route === '/user/logout') {
    // Fetch data from redis
    const token = req.token
    var routeNamesDict = {}
    var timeStamps
    var mailid
    const data = await User.findOne({
      'tokens.token': token
    })
    mailid = data.email
    if (!mailid) {
      throw new Error()
    }
    redisClient.hgetall(mailid).then(function (value) {
      routeNamesDict = value // json object
    })
    console.log(routeNamesDict)
    let key, value
    for (key in routeNamesDict) {
      console.log(key)
      value = routeNamesDict[key]
      console.log(value)
      redisClient.smembers(String(value)).then(function (timeStamp) {
        timeStamps = timeStamp
        var activityData = {
          routeName: String(key),
          route: timeStamps
        }
        var activityLength = data.activity.length
        console.log(activityLength)
        if (activityLength === 0) {
          data.activity.push(activityData)
        } else {
          var filterData = data.activity.filter(activity => activity.routeName === key)
          if (filterData.length === 0) {
            data.activity.push(activityData)
          } else {
            var tempTimeStamps = data.activity.route
            tempTimeStamps.concat(timeStamps)
            data.activity.route = tempTimeStamps
          }
        }
      })
      console.log(timeStamps)
    }
    await data.save()
  //  console.log(data)
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
        uniqueHash = timeStamp.toISOString().concat([email, route])
        console.log('New hash:'.concat(uniqueHash))
        redisClient.hset(email, route, uniqueHash)
      }
      redisClient.sadd(uniqueHash, timeStamp.toString())
    })
  }
  next()
}

module.exports = activity

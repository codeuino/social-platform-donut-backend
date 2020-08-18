const Activity = require('../models/Activity')
const redis = require('../../config/redis')
var redisClient = redis.redisClient
var activityElement = {
  route: '',
  method: '',
  collectionType: '',
  id: '',
  timestamp: ''
}

module.exports = {
  addToRedis: async (req, res, next, collection, objectId) => {
    var route = req.originalUrl.replace(/\?.*$/, '')
    var method = req.method
    var userID = req.user.id.toString()
    console.log('route ', route)
    console.log('methods ', method)

    if (method !== 'GET') {
      var objectID = objectId // post, event, project id
      var timeStamp = Date()
      var collectionType = collection
      // example /auth/login,POST,user,5ed09e9d446f2b1c208b6ba8,Thu Jul 23 2020 20:28:29 GMT+0530 (India Standard Time)
      activityElement = route.concat(',', method, ',', collectionType, ',', objectID, ',', timeStamp)
      console.log('activityElement ', activityElement)
      // userID => [(route, collection, method, objectID), (route,method, collection, objectID) ...]
      await redisClient.rpush(userID, activityElement)
    }
  },
  addActivityToDb: async (req, res) => {
    console.log('add activity to db called!')

    var userID = req.user.id.toString()
    var activityData = await redisClient.lrange(userID, 0, -1)
    console.log('activityData ', activityData)

    const data = await Activity.findOne({ userId: userID })
    console.log('data from db ', data)

    for (let index = 0; index < activityData.length; index++) {
      var activityDataElement = activityData[index].split(',')
      activityElement.route = activityDataElement[0]
      activityElement.method = activityDataElement[1]
      activityElement.collectionType = activityDataElement[2]
      activityElement.id = activityDataElement[3]
      activityElement.timestamp = activityDataElement[4]
      data.activity.unshift(activityElement)
    }

    await data.save()
    console.log('Activity saved to db ', data)

    // clear data from redis
    await redisClient.del(userID, (err, reply) => {
      if (err) {
        console.log('Error in removing key ', userID)
      }
      console.log('Delete reply ', reply)
    })
  }
}

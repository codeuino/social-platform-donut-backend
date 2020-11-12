const redis = require('../../config/redis')
const redisClient = redis.redisClient
const moment = require('moment')
const WINDOW_SIZE_IN_HOURS = 24
const MAX_WINDOW_REQUEST_COUNT = process.env.MAX_WINDOW_REQUEST_COUNT || 500
const WINDOW_LOG_INTERVAL_IN_HOURS = 1

module.exports = {
  customRateLimiter: (req, res, next) => {
    try {
      // check if redis exists
      if (!redisClient) {
        throw new Error('RedisClient not found on the server')
      }
      // if exists check if request made earlier from same ip
      redisClient.get(req.ip, (err, reply) => {
        if (err) {
          console.log('Error in fetching data from redis', err)
        }
        const currentRequestTime = moment()
        // if no reply from redis then store the users request to the server in redis
        if (reply === null || reply === undefined) {
          const newRecord = []
          const info = {
            requestTimeStamp: currentRequestTime.unix(),
            requestCount: 1
          }
          newRecord.unshift(info)
          // set to redis => ip => [{ requestTimeStamp, requestCount }]
          redisClient.set(req.ip, JSON.stringify(newRecord))
          next()
        } else {
          // if record is found, parse it's value and calculate number of requests users has made within the last window
          const data = JSON.parse(reply)

          const windowStartTimestamp = moment()
            .subtract(WINDOW_SIZE_IN_HOURS, 'hours')
            .unix()

          const requestsWithinWindow = data.filter(entry => {
            return entry.requestTimeStamp > windowStartTimestamp
          })

          const totalWindowRequestsCount = requestsWithinWindow.reduce((accumulator, entry) => {
            return accumulator + entry.requestCount
          }, 0)

          // if number of requests made is greater than or equal to the desired maximum, return error
          if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
            return res.status(429).json({
              error: `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_SIZE_IN_HOURS} hrs limit!`
            })
          } else {
            // if number of requests made is less than allowed maximum, log new entry
            const lastRequestLog = data[data.length - 1]
            const potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime
              .subtract(WINDOW_LOG_INTERVAL_IN_HOURS, 'hours')
              .unix()

            //  if interval has not passed since last request log, increment counter
            if (lastRequestLog.requestTimeStamp > potentialCurrentWindowIntervalStartTimeStamp) {
              lastRequestLog.requestCount++
              data[data.length - 1] = lastRequestLog
            } else {
              //  if interval has passed, log new entry for current user and timestamp
              data.unshift({
                requestTimeStamp: currentRequestTime.unix(),
                requestCount: 1
              })
            }
            redisClient.set(req.ip, JSON.stringify(data))
            next()
          }
        }
      })
    } catch (error) {
      console.log('Error in rateLimiter', error)
      next(error)
    }
  }
}

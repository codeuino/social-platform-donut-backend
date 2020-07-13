
const Redis = require('ioredis')
const { RateLimiterRedis } = require('rate-limiter-flexible')

const redisClient = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  family: 4,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB
})

const loginLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login',
  points: 5,
  duration: 60 * 30 // 30 minutes wait time
})

const limiterConsecutiveOutOfLimits = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_consecutive_outoflimits',
  points: 99999,
  duration: 0
})

function getFibonacciBlockDurationMinutes (countConsecutiveOutOfLimits) {
  if (countConsecutiveOutOfLimits <= 1) {
    return 1
  }

  return getFibonacciBlockDurationMinutes(countConsecutiveOutOfLimits - 1) + getFibonacciBlockDurationMinutes(countConsecutiveOutOfLimits - 2)
}

module.exports = {
  // Notifications for a user
  rateLimit: async (email, isLoggedIn) => {
    const redisUserID = await loginLimiter.get(email)
    let retrySecs = 0
    if (isLoggedIn) {
      await limiterConsecutiveOutOfLimits.delete(email)
      return ('reset done')
    }
    if (redisUserID !== null && redisUserID.remainingPoints <= 0) {
      retrySecs = Math.round(redisUserID.msBeforeNext / 1000) || 1
    }
    if (retrySecs > 0) {
      return ('Retry after: '.concat(String(retrySecs)))
    } else {
      try {
        const resConsume = await loginLimiter.consume(email)
        if (resConsume.remainingPoints <= 0) {
          const resPenalty = await limiterConsecutiveOutOfLimits.penalty(email)
          await loginLimiter.block(email, 60 * getFibonacciBlockDurationMinutes(resPenalty.consumedPoints))
        } else {
          return ('admit')
        }
      } catch (rlRejected) {
        if (rlRejected instanceof Error) {
          throw rlRejected
        } else {
          return ('Too many tries, Retry after'.concat(String(Math.round(rlRejected.msBeforeNext / 1000)) || 1))
        }
      }
    }
  }
}

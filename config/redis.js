const Redis = require('ioredis')
const redisClient = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  family: 4,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB
})

exports.redisClient = redisClient

const Redis = require('ioredis')
const redisClient = new Redis()

redisClient.on('connect', () => {
  console.log('redis connected!')
})

redisClient.on('error', (error) => {
  console.log(process.env.REDIS_PORT)
  console.log(process.env.REDIS_HOST)
  console.log('redis error', error)
})

exports.redisClient = redisClient

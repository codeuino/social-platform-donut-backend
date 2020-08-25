const app = require('../app').app
const mongoose = require('mongoose')
const request = require('supertest')
const jwt = require('jsonwebtoken')
const User = require('../app/models/User')
const HttpStatus = require('http-status-codes')
const redis = require('../config/redis')
const userId = mongoose.Types.ObjectId()
const randomDigit = Math.floor(Math.random() * 90 + 10)

var token = ''
const demoUser = {
  name: {
    firstName: 'test',
    lastName: 'test'
  },
  email: `test${randomDigit}@mailinator.com`,
  phone: `12345678${randomDigit}`,
  password: 'abc12345',
  info: {
    about: {
      shortDescription: 'this is short description',
      longDescription: 'this is a very long description',
      website: 'https://www.google.com',
      designation: 'software engg',
      skills: [
        'c++',
        'java'
      ],
      education: [{
        school: {
          schoolName: 'firstSchoolName',
          year: '2017-2021'
        }
      },
      {
        school: {
          schoolName: 'secondSchoolName',
          year: '2007-2014'
        }
      }
      ],
      location: 'location'
    }
  }
}

const testUser = {
  _id: userId,
  ...demoUser,
  email: `test${randomDigit}@mailinator.com`,
  phone: `12345678${randomDigit}`,
  tokens: [{
    token: jwt.sign({
      _id: userId
    }, 'process.env.JWT_SECRET')
  }]
}

let server
/**
 * This will pe performed once at the beginning of the test
 */
beforeAll(async (done) => {
  await User.deleteMany()
  await redis.flushall()
  await new User(testUser).save()
  jest.setTimeout(500000)
  server = app.listen(4000, () => {
    global.agent = request.agent(server)
  })
  const response = await request(app)
    .post('/auth/login')
    .send({
      email: demoUser.email,
      password: demoUser.password
    })
  token = response.body.token
  done()
})

/**
 * Testing Rate limiter
 */
test('Should exceed the no of request', async (done) => {
  // eslint-disable-next-line no-unused-vars
  var response
  var status = 200
  while (status !== 429) {
    response = await request(app)
      .get('/user/link/invite?role=user')
      .set('Authorization', `Bearer ${token}`)
      .send()
    status = response.status
  }
  console.log('response ', response.status)
  expect(response.status).toBe(HttpStatus.TOO_MANY_REQUESTS)
  // flush redis
  redis.redisClient.del(demoUser._id, (err, res) => {
    if (err) {
      console.log('error in redis flush ', err)
    }
    console.log('res ', res)
  })
  done()
})

afterAll(async () => {
  // avoid jest open handle error
  await new Promise((resolve) => setTimeout(() => resolve(), 500))
  // close server
  await server.close()
  // flush redis
  await redis.flushall()
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close()
})

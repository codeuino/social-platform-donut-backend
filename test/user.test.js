const app = require('../app')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const request = require('supertest')
const User = require('../app/models/User')

const testUserId = new mongoose.Types.ObjectId()
const testUser = {
  _id: testUserId,
  name: 'test user',
  email: 'testuser@mailinator.com',
  password: 'testUser@123',
  tokens: [{
    token: jwt.sign({ _id: testUserId }, process.env.JWT_SECRET)
  }]
}
const demoUser = {
  name: 'demo user',
  email: 'demouser@demo.com',
  password: 'demoUser@123'
}

/**
 * This deletes all the existing user in database,
 * and creates a new user in database with the provided details.
 */
beforeEach(async () => {
  await User.deleteMany()
  await new User(testUser).save()
})

/**
 * Testing user signup
 */
test('Should signup new user', async () => {
  const response = await request(app)
    .post('/user')
    .send({
      name: demoUser.name,
      email: demoUser.email,
      password: demoUser.password
    })
    .expect(201)

  // Assert that db was changed
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // Assertions about the response
  // expect(response.body.user.name).toBe('Devesh')
  // OR
  expect(response.body).toMatchObject({
    user: {
      name: 'demo user',
      email: 'demouser@demo.com'
    },
    token: user.tokens[0].token
  })

  expect(user.password).not.toBe('devesh@123')
})

/**
 * TODO: FIX ERROR
 * This is a temporary fix to issue:
 * Jest has detected the following 1 open handle potentially keeping Jest from exiting
 */
afterAll(done => {
  // Closing the DB connection allows Jest to exit successfully.
  mongoose.connection.close()
  done()
})

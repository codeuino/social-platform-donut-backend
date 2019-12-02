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

let server
/**
 * This will pe performed once at the begining of the test
 */
beforeAll(async (done) => {
  await User.deleteMany()
  server = app.listen(4000, () => {
    global.agent = request.agent(server)
    done()
  })
})

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

/** Testing user login */
test('Login existing user', async () => {
  const response = await request(app)
    .post('/auth/login')
    .send({
      email: testUser.email,
      password: testUser.password
    })
    .expect(200)

  const user = await User.findById(testUserId)
  expect(response.body.token).toBe(user.tokens[1].token)
})

/** Testing non existing user login */
test('Should not login non-existing user', async () => {
  await request(app).post('/auth/login').send({
    email: 'random@random.com',
    password: 'random@123'
  }).expect(400)
})

/** Fetch authenticated user profile */
test('Should get profile for user', async () => {
  await request(app)
    .get('/user/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)
})

/** Fail in getting unathenticated user profile */
test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/user/me')
    .send()
    .expect(401)
})

/** Delete authenticated user profile */
test('Should delete profile of authenticated user', async () => {
  await request(app)
    .delete('/user/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)

  // Assert that user was deleted
  const user = await User.findById(testUserId)
  expect(user).toBeNull()
})

/** Fail deleting user profile of unauthenticated user */
test('Should not delete profile of unauthenticated user', async () => {
  await request(app)
    .delete('/user/me')
    .send()
    .expect(401)
})

/**
 * TODO: FIX ERROR
 * This is a temporary fix to issue:
 * Jest has detected the following 1 open handle potentially keeping Jest from exiting
 */
afterAll(async () => {
  // close server
  await server.close()
  // delete all the users post testing
  await User.deleteMany()
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close()
})

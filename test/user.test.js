const app = require('../app')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const request = require('supertest')
const User = require('../app/models/User')
const HttpStatus = require('http-status-codes')
let token = ''
let passwordToken = ''

const demoUser = {
  name: {
    firstName: 'test',
    lastName: 'test'
  },
  email: 'test3@mailinator.com',
  phone: '1234567890',
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

const testUserId = new mongoose.Types.ObjectId()
const testUser = {
  _id: testUserId,
  ...demoUser,
  email: 'test@mailinator.com',
  phone: '1234567891',
  tokens: [{
    token: jwt.sign({
      _id: testUserId
    }, 'process.env.JWT_SECRET')
  }]
}
let server
/**
 * This will pe performed once at the beginning of the test
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
    .send(demoUser)
    .expect(HttpStatus.CREATED)

  // Assert that db was changed
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // Assertions about the response
  // expect(response.body.user.name.firstName).toBe('Rupesh')
  // OR
  expect(response.body).toMatchObject({
    user: {
      name: {
        firstName: demoUser.name.firstName,
        lastName: demoUser.name.lastName
      },
      email: demoUser.email,
      phone: demoUser.phone,
      info: {
        about: {
          skills: demoUser.info.about.skills,
          shortDescription: demoUser.info.about.shortDescription,
          longDescription: demoUser.info.about.longDescription,
          website: demoUser.info.about.website,
          designation: demoUser.info.about.designation,
          education: demoUser.info.about.education,
          location: demoUser.info.about.location
        }
      }
    },
    token: user.tokens[0].token
  })
  expect(user.password).not.toBe('abc12345') // to check hashing
})

/** Testing user login */
test('Login existing user', async () => {
  const response = await request(app)
    .post('/auth/login')
    .send({
      email: testUser.email,
      password: testUser.password
    })
    .expect(HttpStatus.OK)

  token = response.body.token
  const user = await User.findById(testUserId)
  expect(response.body.token).toBe(user.tokens[1].token)
})

/** Testing non existing user login */
test('Should not login non-existing user', async () => {
  await request(app).post('/auth/login').send({
    email: 'random@random.com',
    password: 'random@123'
  }).expect(HttpStatus.BAD_REQUEST)
})

/** Fetch authenticated user profile */
test('Should get profile for user', async () => {
  await request(app)
    .get('/user/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(HttpStatus.OK)
})

/** Fail in getting unathenticated user profile */
test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/user/me')
    .send()
    .expect(HttpStatus.UNAUTHORIZED)
})

/** Delete authenticated user profile */
test('Should delete profile of authenticated user', async () => {
  await request(app)
    .delete('/user/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(HttpStatus.OK)

  // Assert that user was deleted
  const user = await User.findById(testUserId)
  expect(user).toBeNull()
})

/** Fail deleting user profile of unauthenticated user */
test('Should not delete profile of unauthenticated user', async () => {
  await request(app)
    .delete('/user/me')
    .send()
    .expect(HttpStatus.UNAUTHORIZED)
})

/** Forgot password request **/
test('Should send the request to change the password ', async () => {
  const response = await request(app)
    .post('/user/password_reset')
    .send({
      email: `${testUser.email}`
    })
    .expect(200)
  passwordToken = response.body.token
  expect(passwordToken).not.toBeNull()
})

/* Password update */
test('Should update the password ', async () => {
  await request(app)
    .post(`/user/password_reset/${passwordToken}`)
    .send({
      password: 'newPassword',
      id: testUserId
    })
    .expect(200)
})

/* Activate account */
test('Should activate the account ', async () => {
  await request(app)
    .get(`/user/activate/${token}`)
    .send({
      token: `${token}`
    })
    .expect(HttpStatus.OK)
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

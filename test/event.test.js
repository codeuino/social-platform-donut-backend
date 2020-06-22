const app = require('../app').app
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const HttpStatus = require('http-status-codes')
const request = require('supertest')
const Event = require('../app/models/Event')
const User = require('../app/models/User')
const randomDigit = Math.floor(Math.random() * 90 + 10)

const testUserId = new mongoose.Types.ObjectId()
const demoEvent = {
  description: {
    shortDescription: 'this is short description',
    longDescription: 'this is a very long description'
  },
  slots: '2345222',
  isOnline: false,
  createdAt: '2020-04-04T06:53:28.018Z',
  eventName: 'Student Developer meeting',
  location: 'New delhi',
  eventDate: '2020-04-04T06:53:28.018Z'
}

const demoRsvp = {
  yes: true
}
const demoUpdatedEvent = {
  description: {
    shortDescription: 'this is short description',
    longDescription: 'this is a very long description'
  },
  slots: '2345222',
  isOnline: false,
  createdAt: '2020-04-04T06:53:28.018Z',
  eventName: 'Student Developer and mentors meeting',
  location: 'New York',
  eventDate: '2020-04-04T06:53:28.018Z'
}

const testEventId = new mongoose.Types.ObjectId()
const testEvent = {
  _id: testEventId,
  ...demoEvent
}

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
  _id: testUserId,
  ...demoUser,
  email: `test${randomDigit + Math.random() * 10}@mailinator.com`,
  phone: `12335678${randomDigit}`,
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
  await Event.deleteMany()
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
beforeEach(async (done) => {
  await Event.deleteMany()
  await new Event(testEvent).save()
  await User.deleteMany()
  await new User(testUser).save()
  done()
})

test('Should signup new user', async (done) => {
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
    }
  })
  expect(user.password).not.toBe('abc12345') // to check hashing
  done()
})

/** Testing user login */
test('Login existing user', async (done) => {
  const response = await request(app)
    .post('/auth/login')
    .send({
      email: testUser.email,
      password: testUser.password
    })
    .expect(HttpStatus.OK)

  const user = await User.findById(testUserId)
  expect(response.body.token).toBe(user.tokens[1].token)
  done()
})
/**
 * Testing event creation
 */
test('Should create new event', async (done) => {
  const response = await request(app)
    .post('/event')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send(demoEvent)
    .expect(HttpStatus.CREATED)

  // Assert that db was changed
  const event = await Event.findById(response.body.event._id)
  expect(event).not.toBeNull()

  // Assertions about the response
  expect(response.body).toMatchObject({
    event: {
      description: {
        shortDescription: demoEvent.description.shortDescription,
        longDescription: demoEvent.description.longDescription
      },
      slots: demoEvent.slots,
      isOnline: demoEvent.isOnline,
      createdAt: demoEvent.createdAt,
      eventName: demoEvent.eventName,
      location: demoEvent.location,
      eventDate: demoEvent.eventDate
    }
  })
  done()
})

/**
 * Testing event updation
 */

test('Should update event', async (done) => {
  const response = await request(app)
    .patch(`/event/${testEventId}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send(demoUpdatedEvent)
    .expect(HttpStatus.OK)

  // Assert that db was changed
  const updatedEvent = await Event.findById(response.body.event._id)
  expect(updatedEvent).not.toBeNull()
  done()
})

/**
 * Testing for the RSVP
 */

test('Should submit the RSVP', async (done) => {
  const response = await request(app)
    .patch(`/event/rsvp/${testEventId}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send(demoRsvp)
    .expect(HttpStatus.OK)
  const rsvpData = await Event.findById(response.body.rsvpData._id)
  expect(rsvpData).not.toBeNull()
  done()
})

/**
 * Testing for event deletion
 */

test('Should delete event', async (done) => {
  await request(app)
    .delete(`/event/${testEventId}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(HttpStatus.OK)

  // Assert that event was deleted
  const event = await Event.findById(testEventId)
  expect(event).toBeNull()
  done()
})

/**
 * Testing for get event by id
 */

test('Should get event by id', async (done) => {
  await request(app)
    .get(`/event/${testEventId}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(HttpStatus.OK)
  done()
})

/**
 * Testing for get all events
 */

test('Should get all the event', async (done) => {
  await request(app)
    .get('/event/all')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(HttpStatus.OK)
  done()
})

/**
 * Testing for the upcoming event
 */
test('Should get all the upcoming event', async (done) => {
  await request(app)
    .get('/event/upcoming')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(HttpStatus.OK)
  done()
})

/**
 * Testing for the events created by a particular user
 */

test('Should get all the events created by user', async (done) => {
  await request(app)
    .get('/event/me/all')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(HttpStatus.OK)
  done()
})

/**
 * TODO: FIX ERROR
 * This is a temporary fix to issue:
 * Jest has detected the following 1 open handle potentially keeping Jest from exiting
 */
afterAll(async () => {
  // avoid jest open handle error
  await new Promise((resolve) => setTimeout(() => resolve(), 500))
  // close server
  await server.close()
  // delete all the events post testing
  await Event.deleteMany()
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close()
})

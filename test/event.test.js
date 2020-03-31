const app = require('../app')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const request = require('supertest')
const Event = require('../app/models/Event')
const User = require('../app/models/User')

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

const testUser = {
  _id: testUserId,
  ...demoUser,
  email: 'test@mailinator.com',
  phone: '1234567891',
  tokens: [{
    token: jwt.sign({
      _id: testUserId
    }, process.env.JWT_SECRET)
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
beforeEach(async () => {
  await Event.deleteMany()
  await new Event(testEvent).save()
  await User.deleteMany()
  await new User(testUser).save()
})

test('Should signup new user', async () => {
  const response = await request(app)
    .post('/user')
    .send(demoUser)
    .expect(201)

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
    .expect(200)

  const user = await User.findById(testUserId)
  expect(response.body.token).toBe(user.tokens[1].token)
})
/**
 * Testing event creation
 */
test('Should create new event', async () => {
  const response = await request(app)
    .post('/event')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send(demoEvent)
    .expect(201)

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
})
/**
 * Testing event updation
 */
test('Should update event', async () => {
  const response = await request(app)
    .patch(`/event/${testEventId}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send(demoUpdatedEvent)
    .expect(201)

  // Assert that db was changed
  const updatedEvent = await Event.findById(response.body.updatedEvent._id)
  expect(updatedEvent).not.toBeNull()
})

// Testing for the RSVP
test('Should submit the RSVP', async () => {
  const response = await request(app)
    .post(`/event/rsvp/${testEventId}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send(demoRsvp)
    .expect(201)
  const rsvpData = await Event.findById(response.body.rsvpData._id)
  expect(rsvpData).not.toBeNull()
})
test('Should delete event', async () => {
  await request(app)
    .delete(`/event/${testEventId}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(201)

  // Assert that event was deleted
  const event = await Event.findById(testEventId)
  expect(event).toBeNull()
})

test('Should get event by id', async () => {
  await request(app)
    .get(`/event/${testEventId}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(201)
})

test('Should get all the event', async () => {
  await request(app)
    .get('/event/all')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(201)
})
/**
 * TODO: FIX ERROR
 * This is a temporary fix to issue:
 * Jest has detected the following 1 open handle potentially keeping Jest from exiting
 */
afterAll(async () => {
  // close server
  await server.close()
  // delete all the events post testing
  await Event.deleteMany()
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close()
})

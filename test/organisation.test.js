const app = require('../app').app
const mongoose = require('mongoose')
const request = require('supertest')
const HttpStatus = require('http-status-codes')
const Organization = require('../app/models/Organisation')
const User = require('../app/models/User')
const jwt = require('jsonwebtoken')
const adminId = new mongoose.Types.ObjectId()
const moderatorId = new mongoose.Types.ObjectId()
const randomDigit = Math.floor(Math.random() * 90 + 10)
let orgId = ''
let token = ''

const testOrg = {
  name: 'test Organization',
  description: {
    shortDescription: 'this is short description',
    longDescription: 'this is long description'
  },
  contactInfo: {
    email: 'organisation@test.com',
    website: 'www.codeuino.org',
    adminInfo: `${adminId}`,
    moderatorInfo: `${moderatorId}`
  }
}

const updatedTestOrg = {
  name: 'Updated test Organization',
  description: {
    shortDescription: 'this is updated short description',
    longDescription: 'this is updated long description'
  },
  contactInfo: {
    email: 'updated@test.com',
    website: 'www.codeuino.org',
    adminInfo: `${adminId}`,
    moderatorInfo: `${moderatorId}`
  }
}

const testUser = {
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
  },
  tokens: [{
    token: jwt.sign({
      _id: `${adminId}`
    }, process.env.JWT_SECRET)
  }]
}

let server
/**
 * This will pe performed once at the beginning of all the test
 */
beforeAll(async (done) => {
  await Organization.deleteMany()
  await new User(testUser).save()
  server = app.listen(4000, () => {
    global.agent = request.agent(server)
  })
  const response = await request(app)
    .post('/auth/login')
    .send({
      email: testUser.email,
      password: testUser.password
    })
  token = response.body.token
  done()
})

/** CREATE THE ORG **/
describe('POST /org/', () => {
  test('should create a new Organization', async (done) => {
    const response = await request(app)
      .post('/org/')
      .set('Authorization', `Bearer ${token}`)
      .send(testOrg)
      .expect(HttpStatus.CREATED)
    orgId = response.body.orgData._id
    /** DB must be changed **/
    const org = await Organization.findById(response.body.orgData._id)
    expect(org).not.toBeNull()

    /** Check the response **/
    expect(response.body).toMatchObject({
      orgData: {
        isArchived: false,
        _id: `${orgId}`,
        name: `${testOrg.name}`,
        description: {
          shortDescription: `${testOrg.description.shortDescription}`,
          longDescription: `${testOrg.description.longDescription}`
        },
        contactInfo: {
          email: `${testOrg.contactInfo.email}`,
          website: `${testOrg.contactInfo.website}`
        }
      }
    })
    done()
  })
})

/** GET ORG DATA**/
describe('GET /org/:id', () => {
  test('Should fetch the Organization data', async (done) => {
    await request(app)
      .get(`/org/${orgId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(HttpStatus.OK)
    done()
  })
})

/** UPDATE ORG DETAILS **/
describe('PATCH /org/:id', () => {
  test('Should update the Organization data', async (done) => {
    await request(app)
      .patch(`/org/${orgId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedTestOrg)
      .expect(HttpStatus.OK)
    done()
  })
})

/** DELETE ORGANIZATION**/
describe('DELETE /org/:id', () => {
  test('Should delete the organization', async (done) => {
    await request(app)
      .delete(`/org/${orgId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(HttpStatus.OK)

    /** Check if deleted or not **/
    const org = await Organization.findById(orgId)
    expect(org).toBeNull()
    done()
  })
})

afterAll(async () => {
  // avoid jest open handle error
  await new Promise((resolve) => setTimeout(() => resolve(), 500))
  // close server
  await server.close()
  // delete all the organization post testing
  await Organization.deleteMany()
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close()
})

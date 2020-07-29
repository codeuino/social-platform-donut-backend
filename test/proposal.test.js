const app = require('../app').app
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const HttpStatus = require('http-status-codes')
const request = require('supertest')
const User = require('../app/models/User')
const Organization = require('../app/models/Organisation')
const Proposal = require('../app/models/Proposal')
const randomDigit = Math.floor(Math.random() * 90 + 10)

const testUserId = new mongoose.Types.ObjectId()
const testOrganizationId = new mongoose.Types.ObjectId()
const testProposalId = new mongoose.Types.ObjectId()
let token = ''

const demoproposal = {
  title: 'Test Proposal',
  organization: testOrganizationId,
  content: 'Content of the example proposal',
  proposalStatus: 'DRAFT',
  creator: testUserId
}

const testProposal = {
  _id: testProposalId,
  ...demoproposal
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
      skills: ['c++', 'java'],
      education: [
        {
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

const demoOrganization = {
  name: 'Codeuino',
  description: {
    shortDescription: 'short desc',
    longDescription: 'long Description included here'
  },
  contactInfo: {
    email: 'organisation@test.com',
    website: 'www.codeuino.org'
  }
}

const testOrganization = {
  _id: testOrganizationId,
  ...demoOrganization
}

const updatedProposalContent = {
  content: 'updated proposal content'
}

const testUser = {
  _id: testUserId,
  ...demoUser,
  email: `test${randomDigit}@mailinator.com`,
  phone: `12345678${randomDigit}`,
  tokens: [
    {
      token: jwt.sign(
        {
          _id: testUserId
        },
        process.env.JWT_SECRET
      )
    }
  ]
}

let server

/**
 * This will pe performed once at the beginning of the test
 */

beforeAll(async (done) => {
  await Proposal.deleteMany()
  await new User(testUser).save()
  await new Organization(testOrganization).save()
  server = app.listen(4000, () => {
    global.agent = request.agent(server)
  })
  const response = await request(app).post('/auth/login').send({
    email: testUser.email,
    password: testUser.password
  })
  token = response.body.token
  done()
})

/**
 * This deletes all the existing user in database,
 * and creates a new user in database with the provided details.
 */
beforeEach(async () => {
  await Proposal.deleteMany()
  await new Proposal(testProposal).save()
})

test('Should create new Proposal', async (done) => {
  const response = await request(app)
    .post('/proposal')
    .set('Authorization', `Bearer ${token}`)
    .send(demoproposal)
    .expect(HttpStatus.CREATED)

  const proposal = await Proposal.findById(response.body.proposal._id)
  expect(proposal).not.toBeNull()

  const userId = response.body.proposal.creator

  expect(response.body).toMatchObject({
    proposal: {
      title: demoproposal.title,
      organization: `${testOrganizationId}`,
      content: demoproposal.content,
      proposalStatus: demoproposal.proposalStatus,
      creator: `${userId}`
    }
  })
  done()
})

// Testing proposal update
test('Should update the content of the proposal', async (done) => {
  await request(app)
    .patch(`/proposal/${testProposalId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updatedProposalContent)
    .expect(HttpStatus.OK)

  done()
})

// Testing proposal delete
const deleteProposalContent = {
  proposalId: testProposalId
}

test('Should delete the proposal', async (done) => {
  await request(app)
    .delete('/proposal')
    .set('Authorization', `Bearer ${token}`)
    .send(deleteProposalContent)
    .expect(HttpStatus.OK)

  // confirm that the proposal was deleted
  const proposal = await Proposal.findById(testProposalId)
  expect(proposal).toBeNull()
  done()
})

// Testing get proposalById
const getByIdContent = {
  proposalId: testProposalId
}

test('Should return the proposal by the given Id', async (done) => {
  await request(app)
    .get(`/proposal/${testProposalId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(getByIdContent)
    .expect(HttpStatus.OK)

  done()
})

afterAll(async () => {
  // avoid jest open handle error
  await new Promise((resolve) => setTimeout(() => resolve(), 500))
  // close server
  await server.close()
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close()
})

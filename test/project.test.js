const app = require('../app').app
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const HttpStatus = require('http-status-codes')
const request = require('supertest')
const Project = require('../app/models/Project')
const User = require('../app/models/User')
const randomDigit = Math.floor(Math.random() * 90 + 10)
const pagination = 10
const page = 1

const testUserId = new mongoose.Types.ObjectId()
const testProjectId = new mongoose.Types.ObjectId()
let token = ''

const demoProject = {
  projectName: 'testing project',
  description: {
    short: 'Short description should be min 10 characters long!',
    long: 'this is long description'
  },
  version: '1.0.1',
  links: [{
    githubLink: 'https://github.com/codeuino'
  }]
}

const testProject = {
  _id: testProjectId,
  ...demoProject
}

const updateProject = {
  projectName: 'testing project update',
  description: {
    short: 'Short description should be min 10 characters long!',
    long: 'this is long description'
  },
  version: '1.0.3',
  links: [{
    githubLink: 'https://github.com/codeuino'
  }]
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
  email: `test${randomDigit}@mailinator.com`,
  phone: `12345678${randomDigit}`,
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
  await Project.deleteMany()
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

/**
 * This deletes all the existing project in database,
 * and creates a new project in database with the provided details.
 */
beforeEach(async () => {
  await Project.deleteMany()
  await new Project(testProject).save()
})

/**
 * Testing project creation
 */
test('Should create new project', async (done) => {
  const response = await request(app)
    .post('/project')
    .set('Authorization', `Bearer ${token}`)
    .send(demoProject)
    .expect(HttpStatus.CREATED)

  // Assert that db was changed
  const project = await Project.findById(response.body.project._id)
  expect(project).not.toBeNull()

  const userId = response.body.project.createdBy

  // Assertions about the response
  expect(response.body).toMatchObject({
    project: {
      projectName: demoProject.projectName,
      description: {
        short: demoProject.description.short,
        long: demoProject.description.long
      },
      version: demoProject.version,
      links: [{
        githubLink: demoProject.links[0].githubLink
      }],
      createdBy: userId
    }
  })
  done()
})

/**
 * Testing get all the projects
 */
test('Should get all projects', async (done) => {
  await request(app)
    .get(`/project?pagination=${pagination}&page=${page}`)
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(HttpStatus.OK)
  done()
})

/**
 * Testing GET project by id
 */

test('Should get project by id', async (done) => {
  await request(app)
    .get(`/project/${testProjectId}`)
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(HttpStatus.OK)
  done()
})

/**
 * Get project of a user
 */

test('Should get all the project created by a user', async (done) => {
  await request(app)
    .get('/project/me/all')
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(HttpStatus.OK)
  done()
})

/**
 * Testing project update
 */
test('Should update the project info', async (done) => {
  await request(app)
    .patch(`/project/${testProjectId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updateProject)
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
  // delete all the projects project testing
  await Project.deleteMany()
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close()
})

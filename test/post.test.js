const app = require('../app')
const mongoose = require('mongoose')
const request = require('supertest')
const PostSchema = require('../app/models/Post')

const demoPost = {
  content: 'This is a test post',
  imgUrl: 'https://contents.mediadecathlon.com/p1578871/k$8a3c7275d5960b5318bd63ead2ee3575/8335766.jpg?&f=x',
  votes: {
    upVotes: {
      count: 1,
      users: {
        user: ['5e808941bff9f99ef9af4e32']
      }
    },
    downVotes: {
      count: 1,
      users: {
        user: ['5e80cb4dd32211b3545dd066']
      }
    }
  }
}

const testPostId = new mongoose.Types.ObjectId()
const testPost = {
  _id: testPostId,
  ...demoPost
}
let server
/**
 * This will pe performed once at the beginning of the test
 */
beforeAll(async (done) => {
  await PostSchema.deleteMany()
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
  await PostSchema.deleteMany()
  await new PostSchema(testPost).save()
})

/**
 * Testing user signup
 */
test('Should create a new post', async () => {
  const response = await request(app)
    .post('/post')
    .send(demoPost)
    .expect(201)

  // Assert that db was changed
  const post = await PostSchema.findById(response.body.post._id)
  expect(post).not.toBeNull()

  // Assertions about the response
  // expect(response.body.user.name.firstName).toBe('Rupesh')
  // OR
  expect(response.body).toMatchObject({
    post: {
      content: demoPost.content,
      votes: {
        upVotes: {
          count: demoPost.votes.upVotes.count,
          users: {
            user: demoPost.votes.upVotes.users.user
          }
        },
        downVotes: {
          count: demoPost.votes.downVotes.count,
          users: {
            user: demoPost.votes.downVotes.users.user
          }
        }
      }
    }
  })
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
  await PostSchema.deleteMany()
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close()
})

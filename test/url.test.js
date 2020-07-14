const app = require('../app').app
const mongoose = require('mongoose')
const request = require('supertest')
const UrlModel = require('../app/models/UrlShortner')
const HttpStatus = require('http-status-codes')
const testUrl = 'http://codeuino.org/codeofconduct'
// let shortUrl = ''

let server
/**
 * This will pe performed once at the beginning of the test
 */
beforeAll(async (done) => {
  await UrlModel.deleteMany()
  server = app.listen(4000, () => {
    global.agent = request.agent(server)
    done()
  })
})

/**
 * Testing Shorten URL
 */
test('Should short the URL', async (done) => {
  const response = await request(app)
    .post('/shortUrl/shorten')
    .send({
      longUrl: `${testUrl}`
    })
    .expect(HttpStatus.CREATED)

  // Assert that db was changed
  const url = await UrlModel.findById(response.body._id)
  expect(url).not.toBeNull()
  // shortUrl = response.body.shortUrl

  // Assertions about the
  expect(response.body).toMatchObject({
    longUrl: `${testUrl}`,
    shortUrl: `${response.body.shortUrl}`,
    urlCode: `${response.body.urlCode}`
  })
  done()
})

/**
 * ShortURL to longUrl
 */

// test('Should redirect to the longUrl ', async (done) => {
//   const param = shortUrl.toString().split('/')[1]
//   shortUrl = 'http://localhost:4000' + '/' + param
//   console.log('ShortUrl ', shortUrl)
//   await request(app)
//     .get(`${shortUrl}`)
//     .expect(301, `${testUrl}`)
//   done()
// })

afterAll(async () => {
  // avoid jest open handle error
  await new Promise((resolve) => setTimeout(() => resolve(), 500))
  // close server
  await server.close()
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close()
})

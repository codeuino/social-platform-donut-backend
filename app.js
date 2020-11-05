require('./config/mongoose')
const express = require('express')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const createError = require('http-errors')
const path = require('path')
const socket = require('socket.io')
const multer = require('multer')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const hpp = require('hpp')
var winston = require('./config/winston')
const rateLimiter = require('./app/middleware/rateLimiter')
const sanitizer = require('./app/middleware/sanitise')
const fileConstants = require('./config/fileHandlingConstants')

const indexRouter = require('./app/routes/index')
const authRouter = require('./app/routes/auth')
const usersRouter = require('./app/routes/user')
const postRouter = require('./app/routes/post')
const eventRouter = require('./app/routes/event')
const shortUrlRouter = require('./app/routes/urlShortner')
const organizationRouter = require('./app/routes/organisation')
const commentRouter = require('./app/routes/comment')
const projectRouter = require('./app/routes/project')
const notificationRouter = require('./app/routes/notification')
const proposalRouter = require('./app/routes/proposal')
const analyticsRouter = require('./app/routes/analytics')
const wikisRouter = require('./app/routes/wikis')
const activityRouter = require('./app/routes/activity')
const ticketRouter = require('./app/routes/ticket')
const passport = require('passport');
const app = express()
const server = require('http').Server(app)
const clientbaseurl = process.env.clientbaseurl ||  'http://localhost:3000'
const passportOAuth = require('./app/middleware/passportOAuth')

app.use(cors({origin: clientbaseurl, credentials: true}))

app.use(bodyParser.json({ limit: '200mb' }))
app.use(cookieParser())
app.use(bodyParser.urlencoded(fileConstants.fileParameters))

// PassportJS for OAuth
app.use(passport.initialize());
passportOAuth.initGoogleAuth();

const memoryStorage = multer.memoryStorage()
app.use(multer({ storage: memoryStorage }).single('file'))

if (process.env.NODE_ENV !== 'testing') {
  server.listen(process.env.SOCKET_PORT || 8810)
}
// WARNING: app.listen(80) will NOT work here!

const io = socket.listen(server)
let count = 0
io.on('connection', (socket) => {
  console.log('socket connected count ', count++)
  io.emit('user connected')
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

morgan.token('data', (req, res) => {
  return JSON.stringify(req.body)
})

app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url" :status :res[content-length] ":referrer" ":user-agent" :data',
    { stream: winston.stream }
  )
)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use((req, res, next) => {
  req.io = io
  next()
})

// TO PREVENT DOS ATTACK AND RATE LIMITER
app.use(rateLimiter.customRateLimiter)

// TO PREVENT XSS ATTACK
app.use(sanitizer.cleanBody)
app.use(helmet())

// TO PREVENT CLICK JACKING
app.use((req, res, next) => {
  res.append('X-Frame-Options', 'Deny')
  res.set('Content-Security-Policy', "frame-ancestors 'none';")
  next()
})

// TO PREVENT THE QUERY PARAMETER POLLUTION
app.use(hpp())

app.use('/notification', notificationRouter)
app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/user', usersRouter)
app.use('/post', postRouter)
app.use('/org', organizationRouter)
app.use('/event', eventRouter)
app.use('/shortUrl', shortUrlRouter)
app.use('/comment', commentRouter)
app.use('/project', projectRouter)
app.use('/proposal', proposalRouter)
app.use('/analytics', analyticsRouter)
app.use('/wikis', wikisRouter)
app.use('/activity', activityRouter)
app.use('/ticket', ticketRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, "route doesn't exist"))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // To include winston logging (Error)
  winston.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${req.body}`
  )

  // render the error page
  res.status(err.status || 500)
  res.render('error')

  // Socket event error handler (On max event)
  req.io.on('error', function (err) {
    console.error('------REQ ERROR')
    console.error(err.stack)
  })
  next()
})

module.exports = { app, io }

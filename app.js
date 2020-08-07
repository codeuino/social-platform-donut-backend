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
var winston = require('./config/winston')
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

const app = express()
const server = require('http').Server(app)

app.use(cors())

app.use(bodyParser.json({ limit: '200mb' }))
app.use(bodyParser.urlencoded(fileConstants.fileParameters))

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

app.use(helmet());
app.use(hpp());

const csrfMiddleware = csurf({
  cookie: true
});

app.use(session({
  secret: 'codeuino',
  resave: false,
  saveUninitialized: true,
  cookie: {
      secure: true,
      httpOnly: true
  }
}));

app.use(cookieParser());
app.use(csrfMiddleware);

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

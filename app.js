require('./config/mongoose')
const express = require('express')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const createError = require('http-errors')
const path = require('path')
const socket = require('socket.io')
const helmet = require('helmet')

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

const app = express()
const server = require('http').Server(app)

server.listen(process.env.SOCKET_PORT || 8810)
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

app.use(logger('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Expires', 0)
  req.io = io
  next()
})

// setting headers for security
app.disable('x-powered-by')
app.use(helmet.xssFilter())
app.use(helmet.referrerPolicy({ policy: 'same-origin' }))
app.use(helmet.noSniff())
app.use(helmet.frameguard({ action: 'sameorigin' }))
app.use(helmet.hsts({
  maxAge: 5184000,
  includeSubDomains: true
}))
app.use(helmet.dnsPrefetchControl())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"]
    // other sources have to mentioned here
  },
  browserSniff: false
}))
app.use(helmet.ieNoOpen())

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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, 'route doesn\'t exist'))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = { app, io }

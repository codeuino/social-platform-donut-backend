require('./config/mongoose')
const express = require('express')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const createError = require('http-errors')
const path = require('path')

const indexRouter = require('./app/routes/index')
const authRouter = require('./app/routes/auth')
const usersRouter = require('./app/routes/user')
const postRouter = require('./app/routes/post')
const eventRouter = require('./app/routes/event')
const shortUrlRouter = require('./app/routes/urlShortner')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/user', usersRouter)
app.use('/post', postRouter)
app.use('/event', eventRouter)
app.use('/shortUrl', shortUrlRouter)

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

module.exports = app

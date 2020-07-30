var appRoot = require('app-root-path')
var winston = require('winston')

const { combine, colorize, printf, timestamp } = winston.format

const logFormat = printf((info) => {
  return `[${info.timestamp}] ${info.level}: ${info.message}`
})

const rawFormat = printf((info) => {
  return `[${info.timestamp}] ${info.level}: ${info.message}`
})

// define the custom settings for each transport (file, console)
var options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false
  },
  errorFile: {
    level: 'error',
    name: 'file.error',
    filename: `${appRoot}/logs/error.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 100,
    colorize: true
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    format: combine(colorize(), rawFormat)
  }
}

// instantiate a new Winston Logger with the settings defined above
var logger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false // do not exit on handled exceptions
})

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function (message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message)
  }
}

winston.addColors({
  debug: 'white',
  error: 'red',
  info: 'green',
  warn: 'yellow'
})

module.exports = logger

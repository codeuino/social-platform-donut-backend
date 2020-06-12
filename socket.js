const webSocker = require('./app').io

module.exports = {
  socketEvents: (io = webSocker) => {
    let count = 0

    io.on('connection', function (socket) {
      console.log('Socket conn count: ' + count++)
      io.emit('user connected')

      socket.on('test', (data) => {
        console.log('test invoked')
        io.emit('test response', { data: data })
      })

      // PROJECT RELATED NOTIFICATIONS
      socket.on('new project added', (data) => {
        console.log('New project data ->', data)
        io.emit('new project', { data: data })
      })

      // EVENTS RELATED NOTIFICATIONS
      socket.on('new event addeed', (data) => {
        io.emit('new event', { data: data })
      })

      // POST RELATED NOTIFICATIONS
      socket.on('create post event', (data) => {
        console.log('create post event invoked')
        io.emit('new post', {
          data: data
        })
      })

      // INTERNET RELATED ISSUE NOTIFICATIONS
      socket.on('internet issue emit', (data) => {
        console.log('Internet issue in ')
        io.emit('internet issue', { data: data })
      })

      socket.on('internet issue resolved emit', (data) => {
        io.emit('internet issue resolved', { data: data })
      })

      socket.on('disconnect', function () {
        io.emit('user disconnected')
      })
      socket.on('test', () => {
        io.emit('test response')
      })
    })
  }
}

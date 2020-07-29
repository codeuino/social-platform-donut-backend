const mongoose = require('mongoose')
class Connection {
  constructor () {
    console.log('DATABSE_URL ', process.env.DATABASE_URL)
    this.url = `${process.env.DATABASE_URL}`
  }

  connect () {
    mongoose.Promise = global.Promise
    mongoose.set('useNewUrlParser', true)
    mongoose.set('useFindAndModify', false)
    mongoose.set('useCreateIndex', true)
    mongoose.set('useUnifiedTopology', true)
    mongoose.connect(this.url)
      .then(() => {
        console.log('mongodb connection successful')
      })
      .catch((err) => {
        console.log('mongodb connection error', err)
      })
  }
}

// SINGLETON CLASS
class Singleton {
  constructor () {
    if (!Singleton.instance) {
      Singleton.instance = new Connection()
    }
  }

  getInstance () {
    return Singleton.instance
  }
}
module.exports = Singleton

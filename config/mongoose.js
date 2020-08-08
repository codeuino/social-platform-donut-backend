const mongoose = require('mongoose')

class Database {
  constructor () {
    this.#connect()
  }

  #connect = () => {
    mongoose
      .connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
      .then(() => {
        console.log('mongodb connection successful')
      })
      .catch((err) => {
        console.log('mongodb connection error', err)
      })
  }
}

// Singleton
const instance = new Database()
Object.freeze(instance)

module.exports = instance

const mongoose = require('mongoose')

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

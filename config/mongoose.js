const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
  .then(() => {
    console.log('Mongo connected!')
  })
  .catch((Err) => {
    console.log('Mongo Error ', Err)
  })

const mongoose = require('mongoose')

mongoose.connect('mongodb://rupesh:abc123@ds125953.mlab.com:25953/testing', {
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

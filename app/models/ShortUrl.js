const mongoose = require('mongoose')

const ShortUrlSchema = new mongoose.Schema({
    longurl: {
        type: String,
        required: true
    },
    urlcode: {
        type: String
    },
    shorturl: {
        type: String
    }
})

const shortURL = mongoose.model('shortURL',ShortUrlSchema);
module.exports = shortURL;
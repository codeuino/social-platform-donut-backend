const fs = require('fs')
var Jimp = require('jimp');
const uploader = require('./uploadToAWS')
const MAX_WIDTH = 768

const imageCompressor = (req, res, next) => {
  try {
    Jimp.read(req.file.buffer, (err, image) => {
      if (err) throw err;

      if (image.bitmap.width > MAX_WIDTH) {
        image.resize(768, Jimp.AUTO)
          .getBuffer(Jimp.AUTO, (err, image) => {
            if (err) throw err

            uploader.uploadToAWS(image, req.file, (err, data) => {
              if (err) throw err

              req.file.href = data.Location
              req.file.key = data.Key
              next(null, true);
            })
          })
      } else {
        image.getBuffer(Jimp.AUTO, (err, image) => {
          if (err) throw err;

          uploader.uploadToAWS(image, req.file, (err, data) => {
            if (err) throw err

            req.file.href = data.Location
            req.file.key = data.Key
            next(null, true);
          })
        })
      }
    })
  } catch(error) {
    next(err, false)
  }
}

module.exports = {
  imageCompressor
}

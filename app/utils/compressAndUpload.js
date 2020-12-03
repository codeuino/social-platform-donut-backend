const uploader = require('./uploadToAWS')
const Promise = require('bluebird')
const Jimp = Promise.promisifyAll(require('jimp'))
const MAX_WIDTH = 768

const imageCompressor = async (req, res, next) => {
  try {
    if (req.file && req.file.buffer && req.file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
      Jimp.readAsync(req.file.buffer)
        .then(image => {
          if(image.bitmap.width > MAX_WIDTH) {
            return image.resize(768, Jimp.AUTO).getBufferAsync(Jimp.AUTO)
          } else {
            return image.getBufferAsync(Jimp.AUTO)
          }
        })
        .then(async (imageBuffer) => {
          return uploader.uploadToAWS(imageBuffer, req.file)
        })
        .then(data => {
          req.file.href = data.Location
          req.file.key = data.Key
          next(null, true);
        })
        .catch(err => {
          throw err
        })
    } else {
      uploader.uploadToAWS(req.file.buffer, req.file)
        .then(data => {
          req.file.href = data.Location
          req.file.key = data.Key
          next(null, true);
        })
    }
  } catch (error) {
    console.log(error.message)
    next(error, false)
  }
}
module.exports = {
  imageCompressor
}

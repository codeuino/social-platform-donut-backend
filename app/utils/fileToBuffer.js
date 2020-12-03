const multer = require('multer')

// type of files allowed
const fileFilter = (req, file, cb) => {
  if (file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const storage = multer.memoryStorage()

exports.processFile = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10 // 10 mb
  },
  fileFilter: fileFilter,
  upload: (err) => {
    if (err instanceof multer.MulterError) {
      throw new Error('error in uploading ' + err)
    }
  }
})

exports.mapToDb = (req, db) => {
  const file = req.file
  db.image.name = file.name
  db.image.href = file.href
  db.image.contentType = file.mime
  db.image.key = file.key
}

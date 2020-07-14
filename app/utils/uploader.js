const multer = require('multer')
const fs = require('fs')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'))
  },
  filename: (req, file, cb) => {
    console.log('files ', file.originalname)
    cb(null, file.originalname)
  }
})

// type of files allowed
const fileFilter = (req, file, cb) => {
  if (file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

exports.upload = multer({
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
  const img = fs.readFileSync(req.file.path)
  db.image.data = img
  db.image.contentType = 'image/png'
}

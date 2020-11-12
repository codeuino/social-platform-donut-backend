const multer = require('multer')
const fs = require('fs')
const path = require('path')
const aws = require('aws-sdk')
const multerS3 = require('multer-s3');

// AWS INIT WITH CONFIG
const s3Config = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  // sessionToken:'', // In most of the cases it's not needed. If using AWS Educate, you'll need this.
  region: process.env.AWS_STORAGE_REGION
})

const multerS3Config = multerS3({
  s3: s3Config,
  bucket: process.env.AWS_BUCKET_NAME,
  metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
  },
  acl: 'public-read',
  key: function (req, file, cb) {
      cb(null, new Date().toISOString() + '-' + file.originalname)
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
  storage: multerS3Config,
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

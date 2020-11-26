const aws = require('aws-sdk')

const uploadToAWS = async (compressedBuffer, file, next) => {

  console.log('compressedBuffer: ', compressedBuffer)

  const awsS3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    // session token only if needed!
    sessionToken: process.env.AWS_SESSION_TOKEN,
    region: process.env.AWS_STORAGE_REGION
  })

  let params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: new Date().toISOString() + '-' + file.originalname,
    Body: compressedBuffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  }
  awsS3.upload(params, function (err, data) {
    if (err) {
      next(err, false)
    } else {
      return next(null, data)
    }
  })
}

module.exports = {
  uploadToAWS
}

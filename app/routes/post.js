require('../../config/mongoose')
const express = require('express')
const router = express.Router()
const userController = require('../controllers/post')
const multer = require('multer')
const uuidv4 = require('uuid/v4')
const DIR = './public/'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR)
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-')
    cb(null, uuidv4() + '-' + fileName)
  }
})

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
      cb(null, true)
    } else {
      cb(null, false)
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'))
    }
  }
})

// CREATE A POST
router.post(
  '/',
  upload.single('imgUrl'),
  userController.create
)

// GET ALL POSTS OF A USER
router.get(
  '/',
  userController.authenticate
)

// TEST
router.get(
  '/',
  userController.test
)

// UPDATE A TASK
router.patch(
  '/:id',
  userController.test
)

// DELETE A TASK
router.delete(
  '/:id',
  userController.test
)

module.exports = router

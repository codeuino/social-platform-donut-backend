const express = require('express');
const router = express.Router();
const discourseController = require('../controllers/discourse');
const authMiddleware = require('../middleware/auth');


router.get(
    `/`,
    authMiddleware,
    discourseController.getOrganizationUrl
);

module.exports = router
const express = require('express');
const router = express.Router();
const integratedAppsController = require('../controllers/integratedApps');
const authMiddleware = require('../middleware/auth');

//Get all integrated apps
router.get(
    '/integrated',
    authMiddleware, 
    integratedAppsController.AllIntegratedApps
)

//Integrate an app
router.post(
    '/integrate/:app',
    authMiddleware,
    integratedAppsController.IntegrateApp
)

module.exports = router
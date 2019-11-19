const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = {
    authenticateUser: async function (req, res, next) {
        const email = req.body.email
        const password = req.body.password
        try {
            const user = await User.findByCredentials(email, password)
            const token = await user.generateAuthToken()
            res.send({ user: user, token: token })
        } catch (error) {
            console.log('error ', error)
            res.status(400).send({ error: error })
        }
    },
    logout: function (req, res, next) {
        res.json({ success: 'ok' })
    },
    logoutAll: function (req, res, next) {
        res.json({ success: 'ok' })
    }
}
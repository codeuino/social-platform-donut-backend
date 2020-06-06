const Organization = require('../models/Organisation')
const HttpStatus = require('http-status-codes')

const isUnderMaintenance = async (req, res, next) => {
  try {
    const org = await Organization.find({})
    if (!org) {
      next(new Error('No org is found!'))
    }
    if (org[0] && org[0].isMaintenance) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        msg: 'Organization is kept under maintenance!'
      })
    } else {
      next()
    }
  } catch (Error) {
    return res.status(HttpStatus.BAD_REQUEST).json({ Error })
  }
}

module.exports = isUnderMaintenance

const HttpStatus = require('http-status-codes')

module.exports = {
  isValidObjectId: (req, res, next) => {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid ticket id' })
    } else {
      next()
    }
  }
}

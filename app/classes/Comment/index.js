const Comment = require('./Comment')

// singleton
const instance = new Comment()
Object.freeze(instance)

module.exports = instance

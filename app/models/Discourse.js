const mongoose = require('mongoose')
const validator = require('validator')

const DiscourseSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        organizationUrl: {
            type: String,
            trim: true,
            validate (organizationUrl) {
                if (!validator.isURL(organizationUrl)) {
                  throw new Error('Not a valid URL')
                }
            }
        }
    }
)

const Discourse = mongoose.model('Discourse', DiscourseSchema)
module.exports = Discourse
const mongoose = require('mongoose')

const RefreshTokenSchema = new mongoose.Schema({
    refreshToken: String
})

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema)
const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
    res.status(400).json({ status: 400, message: 'Send post request to this api' })
})

router.post('/', (req, res) => {
    res.json({ status: 200, message: 'Login' })
})

module.exports = router
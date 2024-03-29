if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const express = require('express')
const path = require('path')

const router = express.Router()


router.get('/', (req, res) => {
    res.render('admin', { something: 'flight' })
})

router.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/404.html'))
})

module.exports = router
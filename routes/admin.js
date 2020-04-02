const express = require('express')
const bcrypt = require('bcryptjs')

const router = express.Router()

const { checUserAdmin } = require('../middlewares')
const { QuarantinedUser, QuarantinedUserUpload, userOutOfArea } = require('../models')
const { randomString } = require('../util')

router.use(checUserAdmin)

router.get('/', async (req, res) => {
    const foundUsers = await QuarantinedUser.find({
        detectedState: req.user.state,
        detectedCity: req.user.city,
        block: req.user.block
    })
    res.render('admin', { users: foundUsers })
})

router.get('/notification', (req, res) => {
    res.redirect('/')
    // res.render('notification')
})

router.get('/patient/:id', async (req, res) => {
    try {
        const foundPatient = await QuarantinedUser.findOne({
            _id: req.params.id
        })
        if (!foundPatient) return res.redirect('/')
        // console.log(foundPatient)
        const foundPatientUpload = await QuarantinedUserUpload.find({ _quarantinedUserId: foundPatient._id }).sort({ createdAt: 1 })
        // console.log(foundPatientUpload)
        const foundUserOutOfAreas = await userOutOfArea.find({ _quarantinedUserId: foundPatient._id }).sort({ createdAt: 1 })
        // console.log(foundUserOutOfAreas)
        res.render('Patient', { user: foundPatient, upload: foundPatientUpload, userOutOfArea: foundUserOutOfAreas })
    } catch (err) {
        console.log(err)
        res.redirect('/')
    }
})

router.post('/patient', (req, res) => {
    let { name1, name2, phoneNumber1, phoneNumber2, age, gender, dateAnnounced, currentStatus, detectedCity, block, detectedState, nationality, address, route, date, latitude, longitude } = req.body
    nationality = 'india'
    currentStatus = 'quarantined'
    let travelHistory = { route, date }
    let password = randomString(8)
    // TODO send random generated password and remove the below line
    password = 'password'
    let quarantineLocation = { latitude: 0, longitude: 0 }
    let registrationLocation = { latitude, longitude }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ status: 500, statusCode: 'failed', error: err })
        }
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ status: 500, statusCode: 'failed', error: err })
            }
            try {
                const result = await QuarantinedUser.create({
                    name1, name2, phoneNumber1, phoneNumber2, age, gender, dateAnnounced, currentStatus, detectedCity, block, detectedState, nationality, address, registrationLocation, quarantineLocation, travelHistory, password: hash
                })
                res.status(201).json({ status: 201, statusCode: 'success', message: 'Registration Successful', user: result })
            } catch (err) {
                // if (err.errmsg) if (err.errmsg.includes('E11000 duplicate key error collection: quarguard.quarantinedusers index: phoneNumber1')) return res.status(400).json({ status: 400, statusCode: 'failed', message: 'Phone Number already registered' })
                // if (err.message) if (err.message.includes('QuarantinedUser validation failed')) return res.status(400).json({ status: 400, statusCode: 'failed', message: err.message })
                if (err.errmsg) if (err.errmsg.includes('E11000 duplicate key error collection: quarguard.quarantinedusers index: phoneNumber1')) {
                    return res.status(400).json({ status: 400, message: 'Phone Number already exists' })
                }
                if (err.message) if (err.message.includes('QuarantinedUser validation failed')) {
                    return res.status(400).json({ status: 400, message: err.message })
                }
                res.status(500).json({ status: 500, message: 'Something went wrong' })
                console.log(err)
            }
        })
    })
})

router.get('/map', (req, res) => {
    latitude = req.query.latitude
    longitude = req.query.longitude
    if (!latitude || !longitude) return res.redirect('/')
    res.render('map', { latitude, longitude })
})

module.exports = router
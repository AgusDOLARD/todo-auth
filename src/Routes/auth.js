const express = require('express')
const db = require('../helpers/dbClient')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
let app = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'secretttt'
const JWT_EXPIRATION_TIME = process.env.JWT_EXPIRATION_TIME || 3600 // one hour

const redisClient = db(1)

// Middleware function to authenticate users with a valid JWT token
const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.sendStatus(401)

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded.user
        next()
    } catch (err) {
        return res.sendStatus(401)
    }
}

// Endpoint to authenticate a user with a valid username and password
app.post('/', async (req, res) => {
    const { user, password } = req.body
    try {
        if (!user || !password) return res.sendStatus(400)

        await redisClient.connect()
        const result = await redisClient.get(user)
        if (result == null) return res.sendStatus(401)

        const userData = JSON.parse(result)
        const passwordMatch = await bcrypt.compare(password, userData.password)
        if (!passwordMatch) return res.sendStatus(401)

        const token = jwt.sign({ user }, JWT_SECRET, {
            expiresIn: JWT_EXPIRATION_TIME
        })
        res.send({ token })
    } catch (error) {
        return res.sendStatus(403)
    } finally {
        await redisClient.quit()
    }
})

// Endpoint to register a new user with a unique username and password
app.post('/register', async (req, res) => {
    const { user, password } = req.body

    try {
        if (!user || !password) return res.sendStatus(400)

        const userExists = await redisClient.get(user)
        if (userExists) return res.sendStatus(409)

        const hashedPassword = await bcrypt.hash(password, 10)
        const userData = JSON.stringify({ user, password: hashedPassword })

        const token = jwt.sign({ user }, JWT_SECRET)

        await redisClient.connect()
        await redisClient.set(user, userData)
        res.send({ token })
    } catch (error) {
        return res.sendStatus(403)
    } finally {
        await redisClient.quit()
    }
})
module.exports = { authRoutes: app, authenticateUser }

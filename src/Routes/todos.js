const express = require('express')
const app = express.Router()
const { authenticateUser } = require('./auth')
const db = require('../helpers/dbClient')

const redisClient = db(0)

// Use the authenticateUser middleware for all routes
app.use(authenticateUser)

// Add a new task to the user's todo list
app.post('/', async (req, res) => {
    let { task } = req.body
    try {
        await redisClient.connect()
        await redisClient.rPush(req.user, task)
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
    } finally {
        await redisClient.quit()
    }
})

// Retrieve all tasks from the user's todo list
app.get('/', async (req, res) => {
    try {
        await redisClient.connect()
        let todo = await redisClient.lRange(req.user, 0, -1)
        res.status(200).json(todo)
    } catch (error) {
        res.sendStatus(500)
    } finally {
        await redisClient.quit()
    }
})

// Update a task at a specific index in the user's todo list
app.put('/:index', async (req, res) => {
    const index = req.params.index
    const { task } = req.body

    try {
        await redisClient.connect()
        const result = await redisClient.lSet(req.user, index, task)
        if (result === 'OK') res.sendStatus(200)
        else res.sendStatus(404)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    } finally {
        await redisClient.quit()
    }
})

// Delete a task at a specific index from the user's todo list
app.delete('/:index', async (req, res) => {
    const index = req.params.index

    try {
        await redisClient.connect()
        const value = await redisClient.lIndex(req.user, index)
        if (value !== null) {
            await redisClient.lRem(req.user, 1, value)
            res.sendStatus(200)
        } else {
            res.sendStatus(404)
        }
    } catch (error) {
        res.sendStatus(500)
    } finally {
        await redisClient.quit()
    }
})

module.exports = { todoRoutes: app }

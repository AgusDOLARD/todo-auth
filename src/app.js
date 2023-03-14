const express = require('express')
const { todoRoutes } = require('./Routes/todos')
const { authRoutes } = require('./Routes/auth')

const SERVER_PORT = process.env.SERVER_PORT || 8080

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/auth', authRoutes)
app.use('/', todoRoutes)

app.listen(SERVER_PORT, () => {
    console.log(`Server running on *:${SERVER_PORT}`)
})

const { createClient } = require('redis')
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

const redisClient = (database) => {
    const client = createClient({ url: REDIS_URL, database })
    client.on('error', (err) => console.log('Redis Client Error', err))
    return client
}

module.exports = redisClient

import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380'

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
})

redisConnection.on('error', (err) => {
  console.error('[Redis] Erro na conexão:', err)
})

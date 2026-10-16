import { afterAll, beforeEach } from 'vitest'
import { prisma } from '../src/prisma'
import { redisConnection } from '../src/redis'

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE lista_espera, consultas, folgas, profissionais, usuarios CASCADE`
  await redisConnection.flushdb()
})

afterAll(async () => {
  await prisma.$disconnect()
})


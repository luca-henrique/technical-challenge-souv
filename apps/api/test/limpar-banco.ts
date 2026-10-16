import { afterAll, beforeEach } from 'vitest'
import { prisma } from '../src/prisma'

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE lista_espera, consultas, folgas, profissionais, usuarios CASCADE`
})

afterAll(async () => {
  await prisma.$disconnect()
})

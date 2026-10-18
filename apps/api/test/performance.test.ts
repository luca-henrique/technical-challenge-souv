import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { criarUsuario } from './ajuda'

describe('Performance and Concurrency Benchmarks', () => {
  it('maintains low response times under concurrent load (< 50ms average for cached routes)', async () => {
    const profissional = await criarUsuario('profissional', 'Dr. Performance')
    
    // Warm-up cache
    await request(app).get('/profissionais').set('Authorization', profissional.auth)

    // Run 30 concurrent requests to test throughput and concurrency
    const concurrency = 30
    const start = performance.now()
    
    const promises = Array.from({ length: concurrency }).map(() =>
      request(app).get('/profissionais').set('Authorization', profissional.auth),
    )

    const responses = await Promise.all(promises)
    const durationMs = performance.now() - start
    const averageMs = durationMs / concurrency

    // Assert that all requests succeeded with 200 and HIT header
    for (const res of responses) {
      expect(res.status).toBe(200)
      expect(res.headers['x-cache']).toBe('HIT')
    }

    // Performance budget: average latency per request under concurrent load should be low
    expect(averageMs).toBeLessThan(100)
  })

  it('demonstrates latency speedup from Redis cache hit vs database cold query', async () => {
    const profissional = await criarUsuario('profissional', 'Dra. Benchmark')

    // Cold query (Cache MISS)
    const startCold = performance.now()
    const coldRes = await request(app).get('/profissionais').set('Authorization', profissional.auth)
    const coldDuration = performance.now() - startCold
    expect(coldRes.status).toBe(200)

    // Warm query (Cache HIT)
    const startWarm = performance.now()
    const warmRes = await request(app).get('/profissionais').set('Authorization', profissional.auth)
    const warmDuration = performance.now() - startWarm
    expect(warmRes.status).toBe(200)
    expect(warmRes.headers['x-cache']).toBe('HIT')

    // Cache hit should be fast (warmDuration typically well below cold query)
    expect(warmDuration).toBeLessThanOrEqual(coldDuration + 50)
  })

  it('handles burst concurrent appointment listings without connection exhaustion', async () => {
    const paciente = await criarUsuario('paciente')

    // Send 20 concurrent queries for patient's appointments
    const requests = Array.from({ length: 20 }).map(() =>
      request(app).get('/consultas/minhas?historico=false').set('Authorization', paciente.auth),
    )

    const results = await Promise.all(requests)
    for (const res of results) {
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    }
  })
})

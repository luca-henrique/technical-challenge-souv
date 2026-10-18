import { performance } from 'node:perf_hooks'
import request from 'supertest'
import { app } from '../src/app'
import { criarUsuario } from '../test/ajuda'

async function runBenchmark() {
  console.log('🚀 Iniciando Benchmark de Performance e Carga da API...')
  
  const usuario = await criarUsuario('profissional', 'Benchmark User')
  const totalRequests = 100
  const latencies: number[] = []

  // Warmup
  await request(app).get('/profissionais').set('Authorization', usuario.auth)

  const startTime = performance.now()

  for (let i = 0; i < totalRequests; i++) {
    const t0 = performance.now()
    const res = await request(app).get('/profissionais').set('Authorization', usuario.auth)
    const t1 = performance.now()
    
    if (res.status === 200) {
      latencies.push(t1 - t0)
    }
  }

  const totalTimeMs = performance.now() - startTime
  const rps = (totalRequests / (totalTimeMs / 1000)).toFixed(2)

  latencies.sort((a, b) => a - b)
  const p50 = latencies[Math.floor(latencies.length * 0.5)].toFixed(2)
  const p95 = latencies[Math.floor(latencies.length * 0.95)].toFixed(2)
  const p99 = latencies[Math.floor(latencies.length * 0.99)].toFixed(2)
  const avg = (latencies.reduce((acc, v) => acc + v, 0) / latencies.length).toFixed(2)

  console.log('\n📊 Resultados do Benchmark:')
  console.log(`- Total de requisições: ${totalRequests}`)
  console.log(`- Tempo total: ${totalTimeMs.toFixed(2)}ms`)
  console.log(`- Vazão estimada: ${rps} req/s`)
  console.log(`- Latência Média: ${avg}ms`)
  console.log(`- Latência p50: ${p50}ms`)
  console.log(`- Latência p95: ${p95}ms`)
  console.log(`- Latência p99: ${p99}ms`)
  console.log('✅ Benchmark concluído com sucesso!')

  process.exit(0)
}

runBenchmark().catch((err) => {
  console.error('Erro no benchmark:', err)
  process.exit(1)
})

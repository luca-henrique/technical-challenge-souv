import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from '../src/app/api/[...path]/route'

describe('BFF (Backend for Frontend) Gateway', () => {
  const fetchOriginal = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = fetchOriginal
  })

  it('encaminha requisição GET para o backend com headers e query params', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: 'prof-1', nome: 'Dr. Roberto' }]), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-cache': 'HIT',
        },
      }),
    )
    globalThis.fetch = mockFetch

    const request = new NextRequest('http://localhost:3100/api/profissionais?especialidade=Cardiologia', {
      method: 'GET',
      headers: {
        authorization: 'Bearer token-jwt-123',
        accept: 'application/json',
      },
    })

    const response = await GET(request, {
      params: Promise.resolve({ path: ['profissionais'] }),
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [urlChamada, configChamada] = mockFetch.mock.calls[0]
    expect(urlChamada).toContain('/profissionais?especialidade=Cardiologia')
    expect(configChamada.method).toBe('GET')
    expect(configChamada.headers.get('authorization')).toBe('Bearer token-jwt-123')
    expect(configChamada.headers.get('x-bff-agent')).toBe('nextjs-bff')

    expect(response.status).toBe(200)
    expect(response.headers.get('x-handled-by')).toBe('nextjs-bff')
    expect(response.headers.get('x-cache')).toBe('HIT')

    const json = await response.json()
    expect(json).toEqual([{ id: 'prof-1', nome: 'Dr. Roberto' }])
  })

  it('encaminha requisição POST com body para o backend', async () => {
    const payload = { email: 'maria@exemplo.com', senha: '123' }
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ token: 'novo-token' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    globalThis.fetch = mockFetch

    const request = new NextRequest('http://localhost:3100/api/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const response = await POST(request, {
      params: Promise.resolve({ path: ['auth', 'login'] }),
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [urlChamada, configChamada] = mockFetch.mock.calls[0]
    expect(urlChamada).toContain('/auth/login')
    expect(configChamada.method).toBe('POST')
    expect(configChamada.body).toBeDefined()

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ token: 'novo-token' })
  })

  it('retorna 502 amigável quando o backend está inacessível', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))

    const request = new NextRequest('http://localhost:3100/api/relatorios/faltas', {
      method: 'GET',
    })

    const response = await GET(request, {
      params: Promise.resolve({ path: ['relatorios', 'faltas'] }),
    })

    expect(response.status).toBe(502)
    const json = await response.json()
    expect(json.erro).toContain('Falha na comunicação com o backend')
  })
})

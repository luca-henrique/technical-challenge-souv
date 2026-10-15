import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { CHAVE_SESSAO, type Sessao } from '../src/lib/sessao'
import { middleware } from '../src/middleware'

function criarRequisicao(caminho: string, sessao?: Sessao) {
  const url = `http://localhost:3100${caminho}`
  const headers = new Headers()
  if (sessao) {
    headers.set('cookie', `${CHAVE_SESSAO}=${encodeURIComponent(JSON.stringify(sessao))}`)
  }
  return new NextRequest(url, { headers })
}

describe('middleware de rotas públicas e privadas', () => {
  it('permite acesso a rota pública (/) para usuário não autenticado', () => {
    const req = criarRequisicao('/')
    const res = middleware(req)
    expect(res.headers.get('location')).toBeNull()
  })

  it('redireciona usuário autenticado na rota pública (/) para a área do seu perfil', () => {
    const req = criarRequisicao('/', {
      token: 'token123',
      usuario: { id: '1', nome: 'Paciente Teste', perfil: 'paciente' },
    })
    const res = middleware(req)
    expect(res.headers.get('location')).toBe('http://localhost:3100/paciente')
  })

  it('redireciona usuário não autenticado que tenta acessar rota privada para /', () => {
    const req = criarRequisicao('/paciente')
    const res = middleware(req)
    expect(res.headers.get('location')).toBe('http://localhost:3100/')
  })

  it('permite acesso de usuário com perfil correspondente na rota privada (/paciente)', () => {
    const req = criarRequisicao('/paciente', {
      token: 'token123',
      usuario: { id: '1', nome: 'Paciente Teste', perfil: 'paciente' },
    })
    const res = middleware(req)
    expect(res.headers.get('location')).toBeNull()
  })

  it('redireciona usuário com perfil diferente para a área correta dele', () => {
    const req = criarRequisicao('/recepcao', {
      token: 'token123',
      usuario: { id: '1', nome: 'Paciente Teste', perfil: 'paciente' },
    })
    const res = middleware(req)
    expect(res.headers.get('location')).toBe('http://localhost:3100/paciente')
  })
})

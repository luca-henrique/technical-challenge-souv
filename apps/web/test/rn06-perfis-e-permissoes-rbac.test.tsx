import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { CHAVE_SESSAO, encerrarSessao, lerSessao, salvarSessao, type Sessao } from '../src/lib/sessao'
import { middleware } from '../src/middleware'

function criarRequisicao(caminho: string, sessao?: Sessao) {
  const url = `http://localhost:3100${caminho}`
  const headers = new Headers()
  if (sessao) {
    headers.set('cookie', `${CHAVE_SESSAO}=${encodeURIComponent(JSON.stringify(sessao))}`)
  }
  return new NextRequest(url, { headers })
}

describe('RN06: Perfis de Usuário e Controle de Acesso - RBAC (Front-end)', () => {
  describe('Next.js Edge Middleware: Proteção de Rotas e Redirecionamentos', () => {
    it('redireciona usuário deslogado tentando acessar rotas privadas (/paciente, /recepcao, /profissional) para login (/)', () => {
      const rotasPrivadas = ['/paciente', '/paciente/agendar', '/recepcao', '/profissional']
      for (const rota of rotasPrivadas) {
        const req = criarRequisicao(rota)
        const res = middleware(req)
        expect(res.headers.get('location')).toBe('http://localhost:3100/')
      }
    })

    it('redireciona usuário autenticado acessando a raiz pública (/) para a área do seu perfil', () => {
      const perfis: Array<{ perfil: 'paciente' | 'recepcao' | 'profissional'; rota: string }> = [
        { perfil: 'paciente', rota: '/paciente' },
        { perfil: 'recepcao', rota: '/recepcao' },
        { perfil: 'profissional', rota: '/profissional' },
      ]

      for (const { perfil, rota } of perfis) {
        const req = criarRequisicao('/', {
          token: 'token-teste',
          usuario: { id: `id-${perfil}`, nome: `Nome ${perfil}`, perfil },
        })
        const res = middleware(req)
        expect(res.headers.get('location')).toBe(`http://localhost:3100${rota}`)
      }
    })

    it('impede paciente de acessar /recepcao ou /profissional, redirecionando para /paciente', () => {
      const sessaoPaciente: Sessao = {
        token: 'token-paciente',
        usuario: { id: 'p-1', nome: 'Paciente', perfil: 'paciente' },
      }

      const reqRecepcao = criarRequisicao('/recepcao', sessaoPaciente)
      expect(middleware(reqRecepcao).headers.get('location')).toBe('http://localhost:3100/paciente')

      const reqProfissional = criarRequisicao('/profissional', sessaoPaciente)
      expect(middleware(reqProfissional).headers.get('location')).toBe('http://localhost:3100/paciente')
    })

    it('impede recepcionista de acessar /profissional ou /paciente, redirecionando para /recepcao', () => {
      const sessaoRecepcao: Sessao = {
        token: 'token-recepcao',
        usuario: { id: 'r-1', nome: 'Recepcionista', perfil: 'recepcao' },
      }

      const reqProfissional = criarRequisicao('/profissional', sessaoRecepcao)
      expect(middleware(reqProfissional).headers.get('location')).toBe('http://localhost:3100/recepcao')

      const reqPaciente = criarRequisicao('/paciente', sessaoRecepcao)
      expect(middleware(reqPaciente).headers.get('location')).toBe('http://localhost:3100/recepcao')
    })

    it('impede profissional de acessar /recepcao ou /paciente, redirecionando para /profissional', () => {
      const sessaoProfissional: Sessao = {
        token: 'token-prof',
        usuario: { id: 'm-1', nome: 'Médico', perfil: 'profissional' },
      }

      const reqRecepcao = criarRequisicao('/recepcao', sessaoProfissional)
      expect(middleware(reqRecepcao).headers.get('location')).toBe('http://localhost:3100/profissional')

      const reqPaciente = criarRequisicao('/paciente', sessaoProfissional)
      expect(middleware(reqPaciente).headers.get('location')).toBe('http://localhost:3100/profissional')
    })

    it('permite acesso direto a usuários que acessam exatamente as rotas do seu respectivo perfil', () => {
      const perfis: Array<'paciente' | 'recepcao' | 'profissional'> = [
        'paciente',
        'recepcao',
        'profissional',
      ]

      for (const perfil of perfis) {
        const req = criarRequisicao(`/${perfil}`, {
          token: 'token-ok',
          usuario: { id: `id-${perfil}`, nome: `Nome ${perfil}`, perfil },
        })
        const res = middleware(req)
        expect(res.headers.get('location')).toBeNull()
      }
    })
  })

  describe('Sessão Híbrida e Logout', () => {
    it('salva e limpa a sessão corretamente no localStorage e nos cookies', () => {
      const sessao: Sessao = {
        token: 'jwt-12345',
        usuario: { id: 'u-1', nome: 'Usuário Teste', perfil: 'paciente' },
      }

      salvarSessao(sessao)
      expect(lerSessao()).toEqual(sessao)
      expect(document.cookie).toContain(CHAVE_SESSAO)

      encerrarSessao()
      expect(lerSessao()).toBeNull()
      expect(document.cookie).not.toContain(JSON.stringify(sessao))
    })
  })
})

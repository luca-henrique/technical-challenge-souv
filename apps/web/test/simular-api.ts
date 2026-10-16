import { vi } from 'vitest'
import type { Perfil } from '@bemviver/shared'
import { salvarSessao } from '../src/lib/sessao'

// Substitui o fetch. A função recebe o caminho chamado (/api/...) e devolve o corpo da resposta.
// Se devolver um Error, a resposta sai com status 500 e a mensagem do erro.
export function simularApi(responder: (caminho: string, opcoes?: RequestInit) => unknown) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, opcoes) => {
    const corpo = responder(String(url), opcoes)
    if (corpo instanceof Error) {
      return new Response(JSON.stringify({ erro: corpo.message }), { status: 500 })
    }
    if (
      corpo !== null &&
      typeof corpo === 'object' &&
      'status' in corpo &&
      'body' in corpo &&
      typeof (corpo as { status: unknown }).status === 'number'
    ) {
      const resp = corpo as { status: number; body: unknown }
      return new Response(JSON.stringify(resp.body), { status: resp.status })
    }
    return new Response(JSON.stringify(corpo), { status: 200 })
  })
}

export function entrarComo(perfil: Perfil, id = `${perfil}-1`) {
  salvarSessao({ token: 'token-de-teste', usuario: { id, nome: `Usuário ${perfil}`, perfil } })
}

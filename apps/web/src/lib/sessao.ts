import type { Usuario } from '@bemviver/shared'

export interface Sessao {
  token: string
  usuario: Usuario
}

export const CHAVE_SESSAO = 'bemviver-sessao'

export function lerSessao(): Sessao | null {
  if (typeof window === 'undefined') return null
  try {
    const salva = localStorage.getItem(CHAVE_SESSAO)
    if (salva) return JSON.parse(salva)
    const cookie = document.cookie
      .split('; ')
      .find((linha) => linha.startsWith(`${CHAVE_SESSAO}=`))
      ?.split('=')[1]
    return cookie ? JSON.parse(decodeURIComponent(cookie)) : null
  } catch {
    return null
  }
}

export function salvarSessao(sessao: Sessao) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
    document.cookie = `${CHAVE_SESSAO}=${encodeURIComponent(JSON.stringify(sessao))}; path=/; max-age=28800; SameSite=Lax`
  }
}

export function encerrarSessao() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CHAVE_SESSAO)
    document.cookie = `${CHAVE_SESSAO}=; path=/; max-age=0; SameSite=Lax`
  }
}

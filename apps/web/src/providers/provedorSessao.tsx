'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import type { Perfil, Usuario } from '@bemviver/shared'
import {
  CHAVE_SESSAO,
  encerrarSessao,
  lerSessao,
  salvarSessao,
  type Sessao,
} from '@/lib/sessao'

export interface SessaoContextValue {
  sessao: Sessao | null | undefined
  usuario: Usuario | undefined
  perfil: Perfil | undefined
  autenticado: boolean
  definirSessao: (novaSessao: Sessao) => void
  encerrar: () => void
}

export const SessaoContext = createContext<SessaoContextValue | null>(null)

const sessionListeners = new Set<() => void>()

function notifySessionListeners() {
  for (const listener of sessionListeners) {
    listener()
  }
}

function subscribe(callback: () => void) {
  sessionListeners.add(callback)
  const onStorage = (e: StorageEvent) => {
    if (e.key === CHAVE_SESSAO) {
      callback()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    sessionListeners.delete(callback)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CHAVE_SESSAO)
}

function getServerSnapshot(): string | undefined {
  return undefined
}

export function ProvedorSessao({ children }: { children: ReactNode }) {
  const rawSession = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const sessao = useMemo<Sessao | null | undefined>(() => {
    if (rawSession === undefined) return undefined
    return lerSessao()
  }, [rawSession])

  const definirSessao = useCallback((novaSessao: Sessao) => {
    salvarSessao(novaSessao)
    notifySessionListeners()
  }, [])

  const encerrar = useCallback(() => {
    encerrarSessao()
    notifySessionListeners()
  }, [])

  const value = useMemo<SessaoContextValue>(() => {
    return {
      sessao,
      usuario: sessao?.usuario,
      perfil: sessao?.usuario.perfil,
      autenticado: Boolean(sessao?.token),
      definirSessao,
      encerrar,
    }
  }, [sessao, definirSessao, encerrar])

  return <SessaoContext.Provider value={value}>{children}</SessaoContext.Provider>
}

export function useSessaoContext() {
  return useContext(SessaoContext)
}

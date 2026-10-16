'use client'

import { useEffect, useState } from 'react'

export type Tema = 'claro' | 'escuro' | 'sistema'

const CHAVE_STORAGE = 'tema-clinica-bem-viver'

function obterTemaInicial(): Tema {
  if (typeof window === 'undefined') return 'sistema'
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE) as Tema | null
    if (salvo && ['claro', 'escuro', 'sistema'].includes(salvo)) {
      return salvo
    }
  } catch {
    // localStorage indisponível
  }
  return 'sistema'
}

export function aplicarTemaNoDocumento(tema: Tema) {
  if (typeof document === 'undefined') return
  const raiz = document.documentElement
  let prefereEscuro = false

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      prefereEscuro = false
    }
  }

  const deveSerEscuro = tema === 'escuro' || (tema === 'sistema' && prefereEscuro)

  if (deveSerEscuro) {
    raiz.classList.add('dark')
  } else {
    raiz.classList.remove('dark')
  }
}

export function useTema() {
  const [tema, setTemaState] = useState<Tema>(obterTemaInicial)

  useEffect(() => {
    aplicarTemaNoDocumento(tema)

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function tratarMudancaSistema() {
      if (tema === 'sistema') {
        aplicarTemaNoDocumento('sistema')
      }
    }

    mediaQuery.addEventListener?.('change', tratarMudancaSistema)
    return () => {
      mediaQuery.removeEventListener?.('change', tratarMudancaSistema)
    }
  }, [tema])

  function definirTema(novoTema: Tema) {
    setTemaState(novoTema)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CHAVE_STORAGE, novoTema)
      } catch {
        // ignora se localStorage estiver bloqueado
      }
    }
    aplicarTemaNoDocumento(novoTema)
  }

  function alternarTema() {
    let proximo: Tema
    if (tema === 'claro') {
      proximo = 'escuro'
    } else if (tema === 'escuro') {
      proximo = 'sistema'
    } else {
      // Se estiver em 'sistema', alterna para o modo oposto ao do SO para haver mudança visual imediata
      const prefereEscuro =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      proximo = prefereEscuro ? 'claro' : 'escuro'
    }
    definirTema(proximo)
  }

  return {
    tema,
    definirTema,
    alternarTema,
    montado: true,
  }
}

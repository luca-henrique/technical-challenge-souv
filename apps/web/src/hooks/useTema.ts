'use client'

import { useEffect, useState } from 'react'

export type Tema = 'claro' | 'escuro' | 'sistema'

const CHAVE_STORAGE = 'tema-clinica-bem-viver'

function obterTemaInicial(): Tema {
  if (typeof window === 'undefined') return 'sistema'
  const salvo = localStorage.getItem(CHAVE_STORAGE) as Tema | null
  if (salvo && ['claro', 'escuro', 'sistema'].includes(salvo)) {
    return salvo
  }
  return 'sistema'
}

export function useTema() {
  const [tema, setTemaState] = useState<Tema>(obterTemaInicial)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function aplicarTema(atual: Tema) {
      const raiz = document.documentElement
      const prefereEscuro = mediaQuery.matches
      const deveSerEscuro = atual === 'escuro' || (atual === 'sistema' && prefereEscuro)

      if (deveSerEscuro) {
        raiz.classList.add('dark')
      } else {
        raiz.classList.remove('dark')
      }
    }

    aplicarTema(tema)

    function tratarMudancaSistema() {
      if (tema === 'sistema') {
        aplicarTema('sistema')
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
      localStorage.setItem(CHAVE_STORAGE, novoTema)
    }
  }

  function alternarTema() {
    if (tema === 'claro') definirTema('escuro')
    else if (tema === 'escuro') definirTema('sistema')
    else definirTema('claro')
  }

  return {
    tema,
    definirTema,
    alternarTema,
    montado: true,
  }
}
